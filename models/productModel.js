const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'product must have a name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'product must have a description'],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, 'product must have a quantity']
    },
    price: {
        type: Number,
        required: [true, 'product must have a price']
    },
    image: {
        type: String,
        required: [true, 'product must have a image']
    },
    category: {
        type: String,
        required: [true, 'product must have a category']
    },
    type: {
        type: String,
        required: [true, 'product must have a type']
    },
    size : {
        type : Array
    },
    rating: {
        type: Number,
        default: 4.5
    },
    nRating: {
        type: Number,
        default: 100
    },
    position: String,
    common: Boolean,

},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id'
});

const Product = mongoose.model('Product', productSchema)

module.exports = Product