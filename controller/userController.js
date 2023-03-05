const multer = require('multer');
const path = require('path')
const appRoot = require('app-root-path')

const APIFeatures = require('./../toolSearchQuery/APIQuery');
const User = require('./../models/userModel')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + "/public/img/imageUser");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });


exports.uploadUserPhoto = upload.single('users')


exports.getImageUser = async (req, res, next) => {
    // const image = req.file.filename
    // console.log(req.file)

    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    // console.log(image)
    next()
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};
exports.getAllUser = async (req, res, next) => {
    try {
        const feature = new APIFeatures(User.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()

        const users = await feature.query

        res.status(200).json({
            status: 'success',
            data: {
                users
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}
exports.createUser = async (req, res, next) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })

        await user.save({ validateBeforeSave: false })

        res.status(201).json({
            status: 'success',
            data: {
                user
            }
        })

    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err
        })
    }
}
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}
exports.updateMe = async (req, res, next) => {

    try {
        if (req.body.password || req.body.passwordConfirm) {
            throw new Error('this routes not update password')
        }
        const filteredBody = filterObj(req.body, 'name', 'email');

        if (req.file) {
            filteredBody.photo = req.file.filename
        }
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
};

exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { active: false });

        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if (!newUser) {
            throw new Error('NOT FOUND THIS ID USER')
        }
        res.status(200).json({
            status: 'success',
            data: {
                newUser
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const newUser = await User.findByIdAndDelete(req.params.id)

        if (!newUser) {
            throw new Error('NOT FOUND THIS ID USER')
        }

        res.status(204).json({
            status: 'success',
            data: null
        })

    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.addToCart = async (req, res, next) => {
    try {
        const userCurrent = req.user

        const productId = req.body.productId
        const quantity = req.body.quantity
        await userCurrent.HandleAddToCart(productId, quantity)

        res.status(200).json({
            status: 'success',
            data: {
                userCurrent
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}


exports.removeToCart = async (req, res, next) => {
    try {
        const productId = req.body.productId
        const currentUser = req.user
        await currentUser.HandleRemoveToCart(productId)
        res.status(200).json({
            status: 'success',
            data: {
                currentUser
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.decreaseToCart = async (req, res, next) => {
    try {
        const productId = req.body.productId
        const currentUser = req.user
        await currentUser.HandleDecreaseToCart(productId)
        res.status(200).json({
            status: 'success',
            data: {
                currentUser
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}
exports.increaseToCart = async (req, res, next) => {
    try {
        const productId = req.body.productId
        const currentUser = req.user
        await currentUser.HandleIncreaseToCart(productId)
        res.status(200).json({
            status: 'success',
            data: {
                currentUser
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.addToWishlist = async (req , res , next) => {
    try{
        const currentUser = req.user 
        const productId = req.body.productId
        await currentUser.HandleAddToWishlist(productId)
        res.status(200).json({
            status: 'success',
            data: {
                currentUser
            }
        })
    }
    catch(err){
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.deleteToWishlist = async (req , res , next) => {
    try{
        const currentUser = req.user 
        const productId = req.body.productId
        await currentUser.HandleRemoveToWishlist(productId)
        res.status(200).json({
            status: 'success',
            data: {
                currentUser
            }
        })
    }
    catch(err){
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.getCart = async (req , res ,next) => {
    try{
        const userCart = await User.findById(req.params.id)

        const obj = userCart.cart.items

        res.status(200).json({
            status : 'success',
            data : {
                obj
            }
        })
    }
    catch(err){
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

