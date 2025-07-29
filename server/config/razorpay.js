const razorpay = require('razorpay');
require('dotenv').config();

exports.instance = new razorpay( {
  key_id:"rzp_test_FOHgrngSS3ypOk",
  key_secret:"R9CQTqDxpNlHzXTPB4zcQNMV",
})
// exports.instance = new razorpay( {
//   key_id:process.env.RAZORPAY_KEY ,
//   key_secret:process.env.RAZORPAY_SECRET,
// })