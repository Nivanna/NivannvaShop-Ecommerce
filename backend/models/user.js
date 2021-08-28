const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:   {
        type: String,
        required: [true, 'please enter you name'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'please enter you email'],
        unique: true,
        validate: [validator.isEmail, 'please enter valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter your password'],
        minlength: [6, 'Your password must be longer than 6 character'],
        select: false
    },
    avatar:{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String, 
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpire: {type: Date}
});

//Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken  = crypto.randomBytes(20).toString('hex');

    //hash and set reset token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //set token expires time
    this.resetPasswordExpire =  Date.now() + 30*60*1000;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);