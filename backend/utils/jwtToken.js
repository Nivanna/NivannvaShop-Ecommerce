const jwt = require('jsonwebtoken');
// create, send, and save token in the cookie

const sendToken  = async (user, statusCode, res)=>{

    //create jwtToken
    const token = await jwt.sign(
        {
            id: user._id,
            createdAt: user.createdAt
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXP_TIME
        }
    )

    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        httpOnly: false
    }


    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    })

}

module.exports = sendToken;