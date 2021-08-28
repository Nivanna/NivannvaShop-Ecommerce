const Order = require("../models/order");
const Product = require('../models/product');
const errorHandler =  require('../utils/errorHandler');

//create new order
exports.newOrder = async (req, res, next)=>{
    try{
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice, 
            shippingPrice,
            totalPrice,
            paymentInfo,

        } = req.body;
        const order  =  await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice, 
            shippingPrice,
            totalPrice,
            paymentInfo,
            user: req.user._id,
            paidAt: Date.now()
        });
        if(!order){
            return next(new errorHandler('can not create order', 403))
        }
        res.status(201).json({
            success: true,
            message: order
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status))
    }
}

//get single order
exports.getSingleOrder = async (req, res, next)=>{
    try{
        const order = await Order.findById(req.params.id);
        if(!order){
            return next(new errorHandler('order not found', 404));
        }
        res.status(201).json({
            success: true,
            message: order
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//admin -> allorder
exports.getAllOrder = async (req, res, next) =>{
    try{
        const allOrders = await Order.find();
        let totalAmount = 0;

        if(!allOrders){
            return next(new errorHandler('order not found', 404));
        }
        allOrders.forEach(order =>{
            totalAmount += order.totalPrice
        })
        res.status(201).json({
            success: true,
            message: allOrders,
            totalPrice: totalAmount
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//admin -> update order
exports.updateOrder = async (req, res, next) =>{
    try{
        const order = await Order.findById(req.params.id);

        if(!order){
            return next(new errorHandler('order not found', 404));
        }
        if(order.orderStatus === "Delivered"){
            return next(new errorHandler('Products are already delivered', 400))
        }
        order.orderItems.forEach(async item =>{
            await updateStock(item.product, item.quantity);
        });
        order.orderStatus = req.body.orderStatus;
        order.deliverAt = Date.now();
        await order.save();
        res.status(201).json({
            success: true,
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
};

async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save();
}

//delete order
exports.deleteOrder = async (req, res, next)=>{
    try{
        const deleteOrder = await Order.findByIdAndDelete(req.params.id);
        if(!deleteOrder){
            return next(new errorHandler('order not found and cannot delete', 404));
        }
        res.status(201).json({
            success: true,
            message: 'order delete'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}