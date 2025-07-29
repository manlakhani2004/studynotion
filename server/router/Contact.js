const express = require('express');
const router = express.Router();


//import controller
const {createContactUs} = require('../controller/ContactUs');

//create routes
router.post('/contactus',createContactUs);

module.exports = router;