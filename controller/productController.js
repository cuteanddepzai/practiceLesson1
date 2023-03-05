const multer = require('multer');
const path = require('path')
const appRoot = require('app-root-path')
const Product = require('./../models/productModel')
const APIQuery = require('./../toolSearchQuery/APIQuery')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + "/public/img/imageProduct");
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

exports.uploadImageProduct = upload.single('uploads')


exports.getImageProduct = async (req, res, next) => {
    // const image = req.file.filename
    // console.log(req.file)

    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    // console.log(image)
    next()
};

exports.getAllProducts = async (req, res, next) => {
    try {

        const feature = new APIQuery(Product.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
        const products = await feature.query

        res.status(200).json({
            status: 'success',
            length: products.length,
            data: {
                products
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

exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'user',
                select: 'name email photo'
            }
        }).exec();

        if (!product) {
            throw new Error('NOT FOUND THIS ID PRODUCT');
        }

        res.status(200).json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (err) {
        res.status(200).json({
            status: 'error',
            message: err.message
        });
    }
};


exports.createProduct = async (req, res, next) => {
    try {
        const objCreate = {
            name: req.body.name,
            description: req.body.description,
            quantity: req.body.quantity,
            price: req.body.price,
            category: req.body.category,
            type: req.body.type,
            size: req.body.size
        }

        if (req.file) {
            objCreate.image = req.file.filename
        }
        if (req.body.position) {
            objCreate.position = req.body.position
        }
        if (req.body.common) {
            objCreate.common = req.body.common
        }

        const product = await Product.create(objCreate)

        res.status(201).json({
            status: 'success',
            data: {
                product
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

exports.updateProduct = async (req, res, next) => {
    try {
        const newProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!newProduct) {
            throw new Error('NOT FOUND THIS PRODUCT ID')
        }
        res.status(200).json({
            status: 'success',
            data: {
                newProduct
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

exports.deleteProduct = async (req, res, next) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id)

        if (!deleteProduct) {
            throw new Error('NOT FOUND THIS ID TO DELETE')
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




