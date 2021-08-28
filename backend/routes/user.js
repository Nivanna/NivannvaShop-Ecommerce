const  express = require('express');
const router = express.Router();

const {
    registerUser,
    userLogin,
    userLogout,
    userForgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateUserProfile,
    allUser,
    getUser,
    adminUpdateUser,
    deleteUser
} = require('../controllers/usersController');

//middleware 
const {
    isAuthenticatedUser,
    authorizeRoles
}  = require('../middlewares/auth'); 

router.post('/register', registerUser);
router.post('/login', userLogin);
router.post('/logout', isAuthenticatedUser, userLogout);
router.post('/password/forgot', isAuthenticatedUser, userForgotPassword);
router.put('/password/reset/:token', isAuthenticatedUser, resetPassword);
router.put('/password/update', isAuthenticatedUser, updatePassword);
router.put('/user/update', isAuthenticatedUser, updateUserProfile);
router.get('/user', isAuthenticatedUser, getUserProfile);
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), allUser);
router.get('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), getUser);
router.put('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), adminUpdateUser);
router.delete('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;