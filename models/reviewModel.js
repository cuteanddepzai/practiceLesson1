const mongoose = require('mongoose')
const Product = require('./../models/productModel')
const reviewSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User'
    },
    product : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Product'
    },
    text : {
        type : String
    } ,
    time : {
        type : Date ,
        default : Date.now()
    }
})

// reviewSchema.pre(/^find/ , function(next){
//     this.populate('user').populate('product')
//     next()
// })

const Review = mongoose.model('Review' , reviewSchema)

module.exports = Review