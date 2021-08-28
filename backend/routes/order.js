const express = require('express');
const router = express.Router();

const {
      newOrder,
      getSingleOrder,
      getAllOrder,
      updateOrder,
      deleteOrder
} = require('../controllers/orderController');

const {
    isAuthenticatedUser,
    authorizeRoles
} = require('../middlewares/auth');

router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);
router.delete('/order/:id', isAuthenticatedUser, deleteOrder);
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrder);
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
module.exports = router;