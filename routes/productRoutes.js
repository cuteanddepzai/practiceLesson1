const express = require('express')
const productController = require('./../controller/productController')
const authController = require('./../controller/authController')
const router = express.Router()




router
    .route('/')
    .get(productController.getAllProducts)
    .post(productController.uploadImageProduct , productController.getImageProduct ,productController.createProduct)
router
    .route('/:id')
    .get(productController.getProduct)
    .patch(productController.updateProduct)
    .delete(productController.deleteProduct)



module.exports = router
