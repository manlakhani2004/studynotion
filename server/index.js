const express = require('express');
const app = express();

//set middleware
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();

const cookieparser = require('cookie-parser');
app.use(cookieparser());

const fileUpload = require('express-fileupload');
app.use(fileUpload({
    tempFileDir:'/tmp',
    useTempFiles:true
}));

const cors = require('cors');
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}))


//mount the route
const userRoutes = require('./router/User')
const profileRoutes = require('./router/Profile')
const paymentRoutes = require("./router/Payment");
const courseRoutes = require('./router/Coures');
const contactUsRoute = require('./router/Contact');

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

//cloudiary connection
const cloudiary = require('./config/cloudinary');
cloudiary.cloudiaryConnection();

//db connection
const connectDB = require('./config/database');
connectDB();

//activate server
const port = process.env.PORT || 4000
app.listen(port,()=>{  
    console.log(`server started at ${port}`);
})

//default route
app.get('/',(req,res)=>{
    return res.json({
        success:true, 
        message:"Your server is up and running..."
    })
})
