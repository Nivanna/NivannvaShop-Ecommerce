const Product = require('../models/product');
const errorHandler = require('../utils/errorHandler');
const APIFeature = require('../utils/apiFeatures');


//get products
exports.getProducts = async (req, res, next )=>{
    try{
        
        const resultPerpage = 4;
        const productsCount = await Product.countDocuments();
        const apiFeature  = new APIFeature(Product.find(), req.query)
                            .search()
                            .filter()
                            .pagination(resultPerpage)
        const products = await apiFeature.query;
        
        if(!products){
            return next(new errorHandler('product not found', 404));
        }
        res.status(201).json(
            {
                success: true,
                numberOfProducts: products.length,
                productsCount: productsCount, 
                resPerPage: resultPerpage,
                message: products
            }
        )
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//get single product
exports.getSingleProduct = async (req, res, next) =>{
    try{
        const prodId = req.params.id;
        const product = await Product.findById({_id: prodId});
        if(!product){
            return next(new errorHandler('product not found', 404));
        }

        res.status(201).json({
            success:true,
            message: product
        })

    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}


// add new product
exports.addProduct = async (req, res, next)=>{
    try{
        req.body.user = req.user.id;
        
        const product = await Product.create(req.body)
        if(!product){
            return next(new errorHandler('product not found', 404));
        }

        res.status(201).json({
            success: true,
            message: 'product added'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}


//update product 
exports.updateProduct = async (req, res, next)=>{
    try{
        const prodId = req.params.id;
        const isUpdated = await Product.findByIdAndUpdate(prodId, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        if(!isUpdated){
            return next(new errorHandler('product not found', 404));
        }
        res.status(201).json({
            success: true,
            message: 'product is updated'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//delete product 

exports.deleteProduct = async (req, res, next) =>{
    try{
        const prodId = req.params.id;
        const isProductDeleted = await Product.findByIdAndDelete({_id: prodId});
        if(!isProductDeleted){
            return next(new errorHandler('product not found', 404));
        }
        res.status(201).json({
            success: true,
            message: 'product is deleted'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//review
exports.productReview = async (req, res, next)=>{
    try{
        const  {
            rating, 
            comment,
            prodId
        } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment

        }
        const product = await Product.findById(prodId);

        if(!product){
            return next(new errorHandler('product not found', 404));
        }
        const isReviewed = product.reviews.find( 
            r=> r.user.toString() === req.user._id.toString()
        )

        if(isReviewed){
            product.reviews.forEach(review =>{
                if(review.user.toString() === req.user._id.toString()){
                    review.comment = comment;
                    review.rating  = rating;
                }
            })
        }else{
            product.reviews.push(review);
            product.numofReviews = product.reviews.length
        }

        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0)/product.reviews.length;
        await product.save();
        res.status(201).json({
            success: true,
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//get review
exports.getProductReview = async (req, res, next)=>{
    try{
        const productReview = await Product.findById(req.query.id);
        if(!productReview){
            return next(new errorHandler('product not found', 404))
        }
        res.status(201).json({
            success: true,
            message: productReview.reviews
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//delete review 
exports.deleteReview = async (req, res, next) =>{
    try{
        const product = await Product.findById(req.query.productId);
        if(!product){
            return next(new errorHandler('product not found', 404));
        }

        const reviews = product.reviews.filter(review =>{
            return review._id.toString() !== req.query.id.toString()
        });

        const numOfReviews = reviews.length;
    
        const ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
    
        await Product.findByIdAndUpdate(req.query.productId, {
            reviews,
            ratings,
            numOfReviews
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
    
        res.status(200).json({
            success: true
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}