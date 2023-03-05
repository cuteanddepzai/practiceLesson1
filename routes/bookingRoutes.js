const express = require('express')
const authController = require('./../controller/authController')
const bookingController = require('./../controller/bookingController')

const router = express.Router()



router.post('/' , authController.protect , bookingController.createBooking)

router.get('/' , authController.protect  , bookingController.getAllBookings)

router.post('/create-checkout-session' , authController.protect , bookingController.paymentCard)
module.exports = router



