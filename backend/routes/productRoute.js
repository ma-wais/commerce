const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, 
    createProductReview, getProductReviews, deleteReview,getAdminProducts
    } = require('../controllers/productController');
const {isAuthenticatedUser,authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/products').get( isAuthenticatedUser, getAllProducts);
router.route('/admin/product/new').post(isAuthenticatedUser, createProduct)
router.route('/product/:id').get(getProductDetails)
    .put(isAuthenticatedUser, updateProduct) 
    .delete(isAuthenticatedUser, deleteProduct)
router.route('/admin/products').get(isAuthenticatedUser, getAdminProducts);

router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews')
    .get(getProductReviews)
   .delete(isAuthenticatedUser, deleteReview);

module.exports = router;