const User = require('../models/user');
const errorHandler = require('../utils/errorHandler');

const validator =  require('validator');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto =  require('crypto');

//register router
exports.registerUser = async (req, res, next) =>{
    try{
        const {name, email, password} = req.body;

        // check email isValid
        const isValidEmail =  validator.isEmail(email);
        if(!isValidEmail){
            return next(new errorHandler('Email is not valid', 400));
        }
        //hash password
        if(password.length <6){
            return next(new errorHandler('Password must be longer than 6 characters', 400));
        }
        const hashPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT));
        if(!hashPassword){
            return next(new errorHandler('Password cannot hash', 400));
        }
        const user = await User.create({
            name, 
            email, 
            password: hashPassword,
            avatar: {
                public_id : "products/i0k1wdwi5hrpmzwxvsds",
                url : "https://res.cloudinary.com/bookit/image/upload/v1606293152/products/i0k1wdwi5hrpmzwxvsds.jpg" 
            }
        })
        if(!user){
            return next(new errorHandler('User cannot register, try again', 400))
        }

        sendToken(user, 200, res);

    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//login controller
exports.userLogin = async (req, res, next) =>{
    try{
        const {email, password} = req.body;

        // check email and password
        if(!email || !password){
            return next(new errorHandler('invalid email or passowrd', 401));
        }
        //check isUserEmail
        const user = await User.findOne({email}).select('+password');

        if(!user){
            return next(new errorHandler('User anauthorize', 401));
        }

        // compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return next(new errorHandler('User anauthorize', 401));
        }

        sendToken(user, 201, res);
    }catch{
        return next(new errorHandler(e.message, e.status));
    }
}

//logout controller
exports.userLogout = async (req, res, next) =>{
    try{
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        res.status(201).json(
            {
                success: true,
                message: 'logged out'
            }
        )
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//Forgot Password
exports.userForgotPassword = async (req, res, next) => {
    try{
        const user  = await User.findOne({email: req.body.email});

        if(!user){
            return next(new errorHandler('invalid userEmail', 403))
        }

        //get reset token
        const resetToken  = user.getResetPasswordToken();
        await user.save();
        //create reset password url
        const resetUrl  = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
        const message = `Your password reset token is as follow:\n\n ${resetUrl}`;

        //send email
        const isSendEmail = await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: message
        });

        if(!isSendEmail){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({
                validateBeforeSave : false
            });
            return res.status(501).json({
                success: false,
                message: "Sending message is fail"
            });
        }
        res.status(200).json({
            success: true,
            message: `Email is sent to: ${user.email}`
        })

    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}
//update | change password
exports.updatePassword = async (req, res, next) =>{
    try{
        const user = await User.findById(req.user.id).select('+password');
        if(!user){
            return next(new errorHandler('unauthorize user', 403));
        }

        //check previous user password is matched
        const isMatched = await bcrypt.compare(req.body.pre_password, user.password);
        if(!isMatched){
            return next(new errorHandler('password is not match', 400));
        }
        
        //hash password 
        const hashPassword = await bcrypt.hash(req.body.new_password, parseInt(process.env.BCRYPT_SALT));
        if(!hashPassword){
            return next(new errorHandler('cannot hash password', 400));
        }

        user.password = hashPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'updated password'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//update user profile
exports.updateUserProfile = async (req, res, next) =>{
    try{
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if(!user){
            return next(new errorHandler('user not found', 404));
        }

        res.status(201).json({
            success: true,
            message: 'user updated'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}
//resetPassword 
exports.resetPassword = async (req, res, next ) =>{
    try{
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {$gte: Date.now()}
        });
        if(!user){
            return next(new errorHandler('password reset token is invalid or expires', 403));
        }

        if(req.body.password !== req.body.confirmpassword){
            return next(new errorHandler('password is not match'), 400);
        }

        // set up new password
        const hashPassword = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));
        if(!hashPassword){
            return next(new errorHandler('Password cannot hash', 400));
        }

        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'reset password is succeed'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//get current logged user detail

exports.getUserProfile = async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            return next(new errorHandler('unauthorized user', 401));
        }
        res.status(201).json({
            success: true,
            message: user
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//admin get all users
exports.allUser = async (req, res, next)=>{
    try{
        const users =  await User.find();

        if(!users){
            return next(new errorHandler('user not found', 404));
        }
        res.status(201).json({
            success: true,
            message: users
        });
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//get specific user
exports.getUser = async (req, res, next)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return new errorHandler('user not found', 404);
        }
        res.status(201).json({
            success:true,
            message: user
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//admin -> update user
exports.adminUpdateUser = async (req, res, next) =>{
    try{
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }

        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if(!user){
            return next(new errorHandler('user not found', 404));
        }

        res.status(201).json({
            success: true,
            message: 'user updated'
        })
    }catch(e){
        return next(new errorHandler(e.message, e.status));
    }
}

//admin -> delete user
exports.deleteUser = async(req, res, next)=>{
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user){
        return next(new errorHandler('user not found', 404))
    }
    res.status(201).json({
        success: true,
        message: 'user is deleted'
    });
}