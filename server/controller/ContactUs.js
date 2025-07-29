const ContactUs = require('../models/ContactUs');
const MailSender = require('../utils/mailsender');
const {contactUsEmail} = require('../email/contactFormRes');

exports.createContactUs = async (req, res) => {
    try {
        //fetch the data
        const { firstName, lastName, email,countrycode, contactNumber, message } = req.body;
        //validate data
        if (!firstName || !lastName || !email || !contactNumber || !message) {
            return res.status(400).json({
                success: false,
                message: "some data missing in contact us"
            })
        }
        //store data in db
        const contactUsDB = await ContactUs.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            countrycode:countrycode,
            contactNumber: contactNumber,
            message: message
        });
        try {
            //send user email
            const sendMailInfoUser = await MailSender(email, "Your Data send successfully", 
                contactUsEmail(email, firstName, lastName, message, contactNumber, countrycode));
            //send studynotion email
            const sendMailToAdmin = await MailSender("studynotion73@gmail.com", "user Contact us", `user send the message is: <b>${message}</b>`)

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "error while sending email to user and admin",
                errorMessage: error.message
            })
        }
        //return success response
        res.status(200).json({
            success: true,
            message: "contact us details store in db and send the mail successfully",
            contactUsDB,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some issue while store conatct us details",
            errorMessage: error.message
        })
    }
}