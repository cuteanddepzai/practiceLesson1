const express = require('express')

const authController = require('./../Controller/authController')
const userController = require('./../controller/userController')
const router = express.Router()


router
    .route('/signup')
    .post(authController.signup)

router
    .route('/signup/googleAccount')
    .post(authController.signupAsGoogle)
router
    .route('/login')
    .post(authController.login)

router.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)

router.patch('/resetPassword/:token', authController.resetPassword)

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.get('/me', authController.protect, userController.getMe, userController.getUser);
router.patch('/updateMe', authController.protect, userController.uploadUserPhoto, userController.getImageUser, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.post('/cart/addToCart', authController.protect, userController.addToCart)
router.delete('/cart/deleteToCart', authController.protect, userController.removeToCart)
router.post('/cart/decreaseToCart', authController.protect, userController.decreaseToCart)
router.post('/cart/increaseToCart', authController.protect, userController.increaseToCart)

router.post('/wishlist/addToWishlist', authController.protect, userController.addToWishlist)
router.post('/wishlist/deleteToWishlist', authController.protect, userController.deleteToWishlist)
router.get('/cart/getCartUser/:id', authController.protect, userController.getCart)

router
    .route('/')
    .get(authController.protect, userController.getAllUser)
    .post(authController.protect, authController.restrictTo('admin'), userController.createUser)
router
    .route('/:id')
    .get(authController.protect, authController.restrictTo('admin'), userController.getUser)
    .patch(authController.protect, authController.restrictTo('admin'), userController.updateUser)
    .delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser)

module.exports = router
