const errorHandler = require('../utils/errorHandler');

module.exports = (err,req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        return res.status(err.statusCode).json({
            success: false,
            error: err,
            errorMessage: err.message,
            stack: err.stack
        })
    }
    if(process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}
        error.message = err.message;
        // Wrong mongodb oject id error handle
        if(err.name === 'CastError'){
            const message = `Resource not found, invalid: ${err.path}`;
            error = new errorHandler(message, 400);
        }

        // Handling mongoose validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.message).map(value => value.message);
            error = new errorHandler(message, 400);
        }

        // Handling mongoose duplicate error
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyvalue)} entered`
            error = new errorHandler(message, 400);
        }

        // Handling wrong JWT error
        if (err.name === 'JsonWebTokenError') {
            const message = 'JSON Web Token is invalid. Try Again!!!'
            error = new errorHandler(message, 400)
        }

        // Handling Expired JWT error
        if (err.name === 'TokenExpiredError') {
            const message = 'JSON Web Token is expired. Try Again!!!'
            error = new errorHandler(message, 400)
        }
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }

}