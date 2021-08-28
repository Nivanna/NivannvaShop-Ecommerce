const express = require('express');
const router = express.Router();

const {
    getProducts, 
    addProduct ,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    productReview,
    getProductReview,
    deleteReview
} = require('../controllers/productsController');

const {
    isAuthenticatedUser, 
    authorizeRoles
} = require('../middlewares/auth');

router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);
router.get('/reviews', getProductReview);
router.put('/product/review', isAuthenticatedUser, productReview);
router.delete('/product/review', isAuthenticatedUser, deleteReview);
router.post('/admin/product/add',isAuthenticatedUser, authorizeRoles('admin'), addProduct );
router.patch('/admin/product/:id',isAuthenticatedUser,authorizeRoles('admin'),  updateProduct);
router.delete('/admin/product/:id',isAuthenticatedUser,authorizeRoles('admin'), deleteProduct);


module.exports = router;