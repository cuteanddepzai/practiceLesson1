

const Review = require('./../models/reviewModel')


exports.getAllReviews = async (req , res , next) =>{
    try{
        const reviews = await Review.find()

        res.status(200).json({
            status : 'success' , 
            data : {
                reviews
            }
        })
    }
    catch(err){
        res.status(400).json({
            status : 'error' ,
            message : err.message
        })
    }
}


exports.createReview = async (req , res , next) => {
    try{
        const review = await Review.create({
            user : req.user._id ,
            product : req.body.product ,
            text : req.body.text
        }) 
        res.status(201).json({
            status : 'success' , 
            data : {
                review
            }
        })
    }
    catch(err){
        res.status(400).json({
            status : 'error' ,
            message : err.message
        })
    }
}


