const errorHandler = require('../utils/errorHandler');
const User =  require('../models/user');
const jwt = require('jsonwebtoken');
//check if user is autheticated or not
exports.isAuthenticatedUser = async (req, res, next) => {
    try{
        const {token}  = req.cookies;
        if(!token){
            return next(new errorHandler('Unauthorize', 401));
        }
        // verirfy user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return next(new errorHandler('Unauthorize', 401));
        }

        //find user
        const user  = await User.findById(decoded.id);
        if(!user){
            return next(new errorHandler('Unauthorize', 401));
        }
        req.user = user;
        next();
    }catch(e){
        return next( new errorHandler('Internal server error', 500));
    }
}
//handling user auth
exports.authorizeRoles = (...roles) =>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(
                new errorHandler(`Role ${req.user.role} is not allowed to access to routes.`, 403)
            );
        }
        next();
    }
}