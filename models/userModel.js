const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Product = require('./../models/productModel')
const userSchema = new mongoose.Schema({
    googleId : {
        type : String ,
    } ,
    name: {
        type: String,
        required: [true, 'Please tell your name']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter password '],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'confirm password again'
        }
    },
    photo: {
        type: String,
        default: 'default-user.jpg'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
    },
    cart: {
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                quantity: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    default: 0
                }
            }
        ],
        subTotal: {
            type: Number,
            default: 0
        }
    },
    wishlist: {
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            }
        ]
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'cart.items.product'
    }).populate({
        path: 'wishlist.items'
    })
    next()
})
userSchema.pre('save', function (next) {
    this.cart.subTotal = this.cart.items.reduce((total, item) => total + item.total, 0)
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


userSchema.methods.HandleAddToCart = async function (productId, quantity) {
    const searchProduct = await Product.findById(productId)
    if (!searchProduct) {
        throw new Error('not found product to add to cart')
    }
    else {
        const cart = this.cart
        const productIndex = cart.items.findIndex(element => {
            return element.product._id.toString() === productId
        })

        if (productIndex > -1) {
            cart.items[productIndex].quantity += quantity
            cart.items[productIndex].total += 1 * quantity * 1 * searchProduct.price
        }
        else {
            cart.items.push(
                {
                    product: productId,
                    quantity: quantity,
                    total: 1 * quantity * searchProduct.price
                })

        }
        await this.save({ validateBeforeSave: false })
        await this.populate('cart.items.product')
        return this
    }
}


userSchema.methods.HandleRemoveToCart = async function (productId) {
    const checkProduct = await Product.findById(productId)
    if (!checkProduct) {
        throw new Error('The Shop No This Product')
    }
    else {

        const cart = this.cart
        const productIndex = cart.items.findIndex(element => {
            return element.product._id.toString() === productId
        })
        if (productIndex > -1) {
            cart.items.splice(productIndex, 1)
        }
        else {
            throw new Error('No item in your cart')
        }
        return this.save({ validateBeforeSave: false })
    }
}

userSchema.methods.HandleDecreaseToCart = async function (productId) {
    const checkProduct = await Product.findById(productId)
    if (!checkProduct) {
        throw new Error('The Shop No This Product')
    }
    else {
        const cart = this.cart
        const productIndex = cart.items.findIndex(element => {
            return element.product._id.toString() === productId
        })

        if (productIndex > -1) {
            cart.items[productIndex].quantity -= 1
            cart.items[productIndex].total -= 1 * checkProduct.price
        }

        return this.save({ validateBeforeSave: false })
    }
}

userSchema.methods.HandleIncreaseToCart = async function (productId) {
    const checkProduct = await Product.findById(productId)
    if (!checkProduct) {
        throw new Error('The Shop No This Product')
    }
    else {
        const cart = this.cart
        const productIndex = cart.items.findIndex(element => {
            return element.product._id.toString() === productId
        })

        if (productIndex > -1) {
            cart.items[productIndex].quantity += 1
            cart.items[productIndex].total += 1 * checkProduct.price
        }

        return this.save({ validateBeforeSave: false })
    }
}

userSchema.methods.HandleAddToWishlist = async function (productId) {
    const checkProduct = await Product.findById(productId)
    if (!checkProduct) {
        throw new Error('The Shop No This Product')
    }
    else {
        const wishlist = this.wishlist

        const wishlistIndex = wishlist.items.findIndex(element => {
            return element._id.toString() === productId
        })
        if (wishlistIndex > -1) {
            throw new Error('Product has been in wishlist')
        }
        else {
            wishlist.items.push(mongoose.Types.ObjectId(productId))
        }
        return this.save({ validateBeforeSave: false })
    }
}

userSchema.methods.HandleRemoveToWishlist = async function (productId) {
    const checkProduct = await Product.findById(productId)
    if (!checkProduct) {
        throw new Error('The Shop No This Product')
    }
    else {
        const wishlist = this.wishlist
        const wishlistIndex = wishlist.items.findIndex(element => {
            return element._id.toString() === productId
        })
        if (wishlistIndex > -1) {
            wishlist.items.splice(wishlistIndex, 1)
        }
        else {
            throw new Error('this product has delete from wishlist , please reload again')
        }
        return this.save({ validateBeforeSave: false })
    }
}




const User = mongoose.model('User', userSchema)




module.exports = User