const { instance } = require('../config/razorpay');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require("crypto")
const mongoose = require("mongoose");
const MailSender = require('../utils/mailsender');
const { courseEnrollmentEmail } = require('../email/courseEnrollmentEmail');
const {paymentSuccessEmail} = require('../email/paymentSucess')
const dotenv = require('dotenv');
dotenv.config();
//initite order 
exports.caputrePayment = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;

    if (courses.length == 0) {
        return res.json({
            success: false,
            message: "Please provided course id"
        })
    }

    let totalAmount = 0;

    for (const course_id of courses) {
        console.log("course id is::::",course_id);
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res.json({
                    success: false,
                    message: "Course not found"
                });
            }
            // console.log("user id is:--------------",mongoose.Types.ObjectId(userId))
            
            if (course.studentsEnrolled.includes(userId)) {
                return res.status(200).json({
                    success: false,
                    message: "You have already enrolled in this course"
                }) 
            }
            totalAmount += course.price;

        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    }

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            message: paymentResponse
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "could not initiate order"

        })
    }
}


//verify payment
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses;

    const userId = req.user.id;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res.status(200).json({ success: false, message: "Payment Failed" })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac("sha256", "R9CQTqDxpNlHzXTPB4zcQNMV")
        // .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");
    if (expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, res)
        return res.status(200).json({ success: true, message: "Payment Verified" })
    }

    return res.status(200).json({ success: false, message: "Payment Failed" })
}




const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please Provide Course ID and User ID"
        })
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student in it
            console.log(userId,courses);
            
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id:courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true }
            )

            console.log("Updated course: ", enrolledCourse)
            if (!enrolledCourse) {
                return res
                    .status(500)
                    .json({ success: false, error: "Course not found" })
            }
            console.log("Updated course: ", enrolledCourse)

            // const courseProgress = await CourseProgress.create({
            //   courseID: courseId,
            //   userId: userId,
            //   completedVideos: [],
            // })

            // Find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        //   courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            )

            console.log("Enrolled student: ", enrolledStudent)
            // Send an email notification to the enrolled student
            // console.log("runinng 1......");
            const emailResponse = await MailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                )
            )
            // console.log("running 2......");
            console.log("Email sent successfully: ", emailResponse.response) 
        } catch (error) { 
            console.log(error)
            return res.status(400).json({ success: false, error: error.message })
        }
    }
}

exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
    //   console.log("student is:",enrollStudents);
      await MailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: `Could not send email ${error}` })
    }
  }

//this for only one product buy at a time
//capture payment and initiate the razorpay order
// exports.capturePayment = async (req, res) => {
//     try {
//         //fetch userid and courseid
//         const { courseId } = req.body;
//         const userId = req.user.id;
//         //validate courseid
//         if (!courseId) {
//             return res.json({
//                 success: false,
//                 message: "course id not found"
//             });
//         }
//         //verify course
//         const courseDetails = await Course.findById(courseId);
//         if (!courseDetails) {
//             return res.json({
//                 success: false,
//                 message: "course id not valid"
//             });
//         }
//         //check user already enrolled in course

//         if (courseDetails.studentsEnrolled.includes(mongoose.Types.ObjectId(userId))) {
//             return res.json({
//                 sucess: false,
//                 message: "user already buy this course"
//             })
//         }
//         try {
//             //create order
//             const option = {
//                 amount: courseDetails.price * 100,
//                 currency: "INR",
//                 receipt: Math.random(Date.now()).toString(),
//                 notes: {
//                     userId: userId,
//                     courseId: courseId
//                 }
//             }
//             const PaymentResponse = await instance.orders.create(option);
//             console.log(PaymentResponse);

//             //return resonse
//             res.status(200).json({
//                 success: true,
//                 message: "Payment successfully",
//                 courseName: courseDetails.courseName,
//                 courseDescription: courseDetails.courseDescription,
//                 thumbnail: courseDetails.thumbnail,
//                 orderId: PaymentResponse.id,
//                 currency: PaymentResponse.currency,
//                 amount: PaymentResponse.amount
//             })
//         } catch (error) {
//             return res.json({
//                 success: false,
//                 message: "some issue while order create"
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "capturePayment not sucess",
//             ErrorMessage: error.message
//         })
//     }
// }

// exports.verifySignature = async (req, res) => {
//     try {
//         const webhookSecret = "12345678";

//         //signature goes through three step
//         const signature = req.headers("x-razorpay-signature");

//         //we webhookSecret convert into three step process did by signature so match them

//         const shasum = crypto.createHmac("sha256", webhookSecret);
//         shasum.update(JSON.stringify(req.body));
//         const digest = shasum.digest("hex");

//         //check if siganture and webhookSecret are same
//         //if same then payment are successfully complated

//         if (signature === digest) {
//             //now perform main action on db
//             const { userId, courseId } = req.body.payload.payment.entity.notes;
//             //add course in studentEnrolled in course model
//             try{
//             const updatedCourse = await Course.findByIdAndUpdate(courseId, {
//                 $push: {
//                     studentsEnrolled: userId
//                 }
//             },{new:true});

//             //add course id in coures key in user model
//             const updatedUser = await User.findByIdAndUpdate(userId, {
//                 $push: {
//                     courses: courseId
//                 }
//             },{new:true})

//             //send mail to user is buy the course
//             //TODO: mail template add
//             const mailInfo = await MailSender(updatedUser.email, "Congratulation from StudyNotion", "You are onboarded into new studynotion course");

//             res.status(200).json({
//                 success:true,
//                 message:"course buy successfully",
//                 updatedCourse,
//                 updatedUser
//             })
//         }catch(error){
//             res.json({
//                 success:false,
//                 message:"problem in store course enrolled details on user and course model",
//                 ErrorMessage:error.message
//             })
//         }
//         }
//         else {
//             res.json({
//                 success: false,
//                 message: "webhookSecret not match"
//             })
//         }



//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "error occur while verify signature"
//         })
//     }
// }