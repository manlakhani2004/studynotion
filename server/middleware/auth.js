const jwt = require('jsonwebtoken');
require('dotenv').config();
//Auth
exports.auth = async (req, res, next) => {
    //fetch token
    try {        
            const token =
			req.cookies.token ||
			req.body.token || 
			req.header("Authorization").replace("Bearer ", "");
                        
        //check if token exist
        if (!token) {
            return res.status(403).json({
                success: false,
                message: "token not found"
            })
        }
        console.log("token for authenitcation",token);

        //verify the token
        try {
            
            let decode =  jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "token not verified"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some went wrong while validating token",
            error: error.message,
        })
    }

}
//isStudent
exports.isStudent = async (req, res, next) => {
    try {
        //fetch the data
        const { role } = req.user;
        if (role !== "Student") {
            return res.status(403).json({
                success: false,
                message: "this is protected route for student"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some went wrong during validating is student route",
            error: error.message
        })
    }

}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        //fetch the data
        const { role } = req.user;
        if (role !== "Instructor") {
            return res.status(403).json({
                success: false,
                message: "this is protected route for Instructor"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some went wrong during validating is Instructor route",
            error: error.message
        })
    }

}

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        //fetch the data
        const { role } = req.user;
        if (role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "this is protected route for Admin"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some went wrong during validating is Admin route",
            error: error.message
        })
    }

}