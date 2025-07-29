const OTP = require('../models/OTP');
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailsender');
const {passwordUpdated} = require('../email/passwordUpdate')
require('dotenv').config();

//send otp
exports.sendOTP = async (req, res) => {
    try {
        //fetch data
        const { email } = req.body;

        //check user email exits or not
        const CheckUserExist = await User.findOne({ email });

        if (CheckUserExist) {
            return res.status(401).json({
                success: false,
                message: "user already exist"
            })
        }

        //otp generate
        var otp =  otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        //validate otp is unique
        // let checkOTP = await OTP.findOne({ otp: otp });

        //run until otp match
        // while (checkOTP) {
        //     otp = await otpGenerator.generate(6, {
        //         upperCaseAlphabets: false,
        //         specialChars: false,
        //         lowerCaseAlphabets: false
        //     });
        //     checkOTP = await OTP.findOne({ otp: otp });
        // }

        //create entery on db
        const OTPdb = await OTP.create({
            email,
            otp
        });

        console.log(OTPdb);

        res.status(200).json({
            success: true,
            message: "otp generate successfully",
            otp
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "otp not generated",
            error: error.message
        })
    }
}


//sign up
exports.signup = async (req, res) => {
    try {
        //fetch data
        const { firstName,
            lastName,
            email,
            password,
            confrimPassword,
            accountType,
            otp } = req.body;

        //validate data
        if (!firstName || !lastName || !email || !password || !confrimPassword) {
            return res.status(403).json({
                success: false,
                message: "some data missing"
            })
        }
        //check user exits
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (user) {
            return res.status(401).json({
                success: false,
                message: "user already exist"
            })
        }
        //check both password match
        if (password !== confrimPassword) {
            return res.status(400).json({
                success: false,
                message: 'password and confrim password not match'
            })
        }
        //find most recent otp form db
        const OTPdb = await OTP.findOne({ otp: otp });
        // console.log(OTPdb);
        // console.log("both otp",OTPdb.otp,otp);
        //validate otp
        if (!OTPdb) {
            return res.status(403).json({
                success: false,
                message: "otp number not found",
            })
        } else if (otp != OTPdb.otp) {
            return res.status(403).json({
                success: false,
                message: "otp number invalid"
            });
        }
        //password hash
        const hashedPass = await bcrypt.hash(password, 10);

        //store addition details 
        const ProfileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        //create enter on db
        const CreateUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPass,
            accountType,
            additionalDetails: ProfileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        if (!CreateUser) {
            res.status(500).json({
                success: false,
                message: "error during store user info on db",
                error: error.message
            })
        }

        //retrun success response
        res.status(200).json({
            success: true,
            message: "user registred successfully",
            user: CreateUser
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some went wrong not registerd user",
            errorMessage: error.message
        })
    }
}


//login
exports.login = async (req, res) => {
    try {
        //fetch data
        const { email, password } = req.body;

        //validate data
        if (!email || !password) {
            return res.status(402).json({
                success: false,
                message: "some data missing"
            })
        }
        //check user exist
        const checkUser = await User.findOne({ email: email }).populate("additionalDetails")
        

        if (!checkUser) {
            return res.status(400).json({
                success: false,
                message: "user not exits",
            })
        }
        //password match
        if (await bcrypt.compare(password, checkUser.password)) {
            //if password match then create token
            const payload = {
                email: checkUser.email,
                id: checkUser._id,
                role: checkUser.accountType 
            }
            let token = jwt.sign(payload, process.env.JWT_SECRET);
            console.log("token is:", token);
            // checkUser = checkUser.toObject();
            checkUser.token = token;
            checkUser.password = undefined;

            //send cookie
            //send cookie 
            let option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            res.cookie('token', token, option);

            res.status(200).json({
                success: true,
                message: "user login successfully",
                user: checkUser,
                token:token
            })
        } else {
            return res.status(403).json({
                success: false,
                message: "password is invalid"
            })
        }
        //retrun success response
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "some went wrong",
            error: error.message
        });
    }
}


//change password
exports.changePassword = async (req, res) => {
    try {
        //fetch data
        const { oldPassword, newPassword } = req.body;
        const userid = req.user.id;
        //validate data
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "some data missing"
            })
        }
        //check old password  is exits
        
        const userDetails = await User.findOne({_id:userid});

        const isMatchPassword = await bcrypt.compare(oldPassword,userDetails.password);
        console.log(oldPassword,userDetails.password);
        if (!isMatchPassword) {
            return res.status(404).json({
                success: false,
                message: "Password is Increct"
            })
        }

        const encryptedPassword = await bcrypt.hash(newPassword,10)

        //if old password exist then update password 
        const UpdatedUser = await User.findOneAndUpdate(
            { _id: userDetails._id }, //Your query to find the user
            { $set: { password: encryptedPassword } }, // Set the new password
            { new: true } // Return the updated document
        );
        // console.log("updated user password:", UpdatedUser);

        //send mail to user
        mailSender(UpdatedUser.email, "Change Passswrod", newPassword);
            // Send notification email
    try {
        const emailResponse = await mailSender(
            UpdatedUser.email,
          "Password for your account has been updated",
          passwordUpdated(
            UpdatedUser.email,
            `Password updated successfully for ${UpdatedUser.firstName} ${UpdatedUser.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }

        res.status(200).json({
            success: true,
            message: "password upadte successfully",
            updatedUser: UpdatedUser
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "password not update some went wrong!",
            error: error.message
        })
    }
}