const mongoose = require('mongoose')
const Product = require('./../models/productModel')
const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    booked: {
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
    address: String ,
    phone : Number ,
    time : {
        type : Date ,
        default : Date.now()
    }
})

bookingSchema.pre("save" , function(next){
    this.populate({
        path : "booked.items.product"
    }).then(() => {
        this.booked.items.forEach(el => {
            el.total = el.product.price * el.quantity
        })

        this.booked.subTotal = this.booked.items.reduce(
            (total, item) => total + item.total,
            0
        );

        next();
    })
})




bookingSchema.methods.updateQuantity = async function(arrProductId){
    const quantityBook = this.booked.items
    console.log(arrProductId)
    for await (const el of arrProductId) {
        const product = await Product.findOne({_id : el.product})
        
        product.quantity -= el.quantity

        await product.save()
    }
}




const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking
