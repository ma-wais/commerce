const express = require('express');
const { 
    registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, 
    updatePassword, updateProfile, getAllUser, getSingleUser, deleteUser, updateUserRole 
    } = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/my').get(isAuthenticatedUser, getUserDetails);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/logout').post(logout);

router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles("admin"), getAllUser )
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles("admin"),getSingleUser)
        .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
        .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);


module.exports = router;
