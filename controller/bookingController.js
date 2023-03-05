const mongoose = require('mongoose')

const Stripe =  require('stripe')('sk_test_51MPco5JCIJAAC9tsOciELCDwMkuEDDEU7UpufjDss4Q1zueZTocrO58aadIuSB4LyF6r1epVUJ9ubfb4rpn5PHIn00KNYM2op0')
const Booking = require('./../models/bookingModel')
const APIquery = require('./../toolSearchQuery/APIQuery')
exports.getAllBookings = async (req, res, next) => {
    try {
        const feature = new APIquery(Booking.find(), req.query)

        const bookings = await feature.query

        res.status(200).json({
            status: 'success',
            data: {
                bookings
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
}


exports.createBooking = async (req, res, next) => {
    try {
        const user = req.user;
        const arrProductId = req.body.arrProductId;
        const address = req.body.address;
        const phone = req.body.phone

        const booking = new Booking({
            user,
            booked: {
                items: arrProductId,
            },
            address,
            phone
        });

        await booking.save();

        await booking.updateQuantity(arrProductId)

        res.status(200).json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};


exports.deleteBooking = async (req, res, next) => {
    try {
        const bookingUser = await Booking.aggregate([
            {
                $match: { user: req.user._id }
            }
        ])



        console.log(bookingUser)
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
}

exports.paymentCard = async (req , res , next) => {
    try{
        const session = await Stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: "T-shirt",
                        },
                        unit_amount: 2000
                    },
                    quantity: 1
                },
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: "T-shirt",
                        },
                        unit_amount: 2000
                    },
                    quantity: 1
                },
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: "T-shirt",
                        },
                        unit_amount: 2000
                    },
                    quantity: 1
                }
            ],
            mode: "payment",
            success_url: `http://localhost:3000/checkout-success`,
            cancel_url: `http://localhost:3000/cart`
        })

        res.status(200).json({
            status: 'success',
            data : {
                url : session.url
            }
        })
    }
    catch(err){
        res.status(400).json({
            status : 'error',
            message : err.message
        })
    }
}


