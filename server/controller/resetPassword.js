const User = require('../models/User');
const mailSender = require('../utils/mailsender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//Token generate and store and send UI Link reset password
exports.resetPasswordToken = async (req, res) => {
    try {
        //fetch email
        const { email } = req.body;
        //check user
        const user = await User.find({ email:email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "email is not registerd to us",
            })
        }
        //generate token
        const token = crypto.randomUUID();
        //store token and expries in db
        const updatedUser = await User.findOneAndUpdate({ email }, {
            token: token,
            tokenExpiredTime: Date.now() + 5 * 60 * 1000,
        },
            { new: true });

        //create Link
        let url = `http://localhost:3000/update-password/${token}`;
        //send email with Link

        await mailSender(email, 
            "Password Reset Link", 
            `Your Link for email verification is:${url}. Please click this url to reset your password.`);
        

        //return respones
        res.status(200).json({
            success: true,
            message: "send password upadte link successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "someting went wrong to send mail or generate token",
            error: error.message
        })
    }
}

//Reset password
exports.ResetPassword = async (req, res) => {
    try {
        //fetch data 
        //token send by front end
        const { password, confrimPassword, token } = req.body;
        //check user by token
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "token is invalid"
            })
        }
        //check token is expire
        if (user.tokenExpiredTime < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "token is expired"
            })
        }
        //checkboth password match 
        if (password !== confrimPassword) {
            return res.status(401).json({
                success: false,
                message: "both password not match"
            })
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //update passwrd
        const updatedUser = await User.findOneAndUpdate({ token }, {
            password: hashedPassword
        });
        //return password
        res.status(200).json({
            success: true,
            message: "password updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some went wrong while reset password",
            error: error.message
        })
    }
}