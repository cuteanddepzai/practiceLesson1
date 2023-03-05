const express = require('express')
const authController = require('./../controller/authController')
const reviewController = require('./../controller/reviewController')
const router = express.Router()

router.get('/' , authController.protect , reviewController.getAllReviews)
router.post('/' , authController.protect , reviewController.createReview)

module.exports = router