const express = require('express');
const router = express.Router();
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.route('/order/new').post(isAuthenticatedUser, newOrder)
router.route('/orders/:id').get(isAuthenticatedUser, getSingleOrder)
router.route('/myorders').get(isAuthenticatedUser, myOrders)

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders )
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
        .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)



module.exports = router;