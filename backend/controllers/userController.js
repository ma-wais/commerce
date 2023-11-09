const ErrorHandler = require("../utils/errorHandler.js");
const Asyncerror = require("../middlewares/asyncerror.js");
const User = require("../models/userModel.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require('cloudinary');

//register user
exports.registerUser = Asyncerror(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale"
    })
    const { name, email, password } = req.body;
    const user = await User.create({
        name,email,password,avatar:{
            public_id:"this is a sample id",
            url:myCloud.secure_url,
        }
    })
    sendToken(user,201,res);
})
// login user
exports.loginUser = Asyncerror(async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email and Password",400 ))
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email or Password",401 ))
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password",401 ))
    }
   sendToken(user,200,res);
})
//logout user
exports.logout = Asyncerror(async (req, res, next) => {
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
})
//forget password
exports.forgotPassword = Asyncerror(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){ return next(new ErrorHandler("User not found",404 )) }
    //get reset token 
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    
    const message = `Your password reset token is :-
     \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;
     try {
        await sendEmail({
            email:user.email,
            subject:"Ecommerce Password Recovery",
            message,
        })
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })}
      catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500 ))
     }
});
// reset password
exports.resetPassword = Asyncerror(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })
    if(!user){ return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400 )) }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400 ))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);
}) ;
// get user details
exports.getUserDetails = Asyncerror(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    });
});
// update user password
exports.updatePassword = Asyncerror(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is incorrect",400 ))
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400 ))
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
})
//update USer profile
exports.updateProfile = Asyncerror(async (req, res, next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
    if (req.body.avatar !== ""){
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avatars",
            width:150,
            crop:"scale"
        })
        newUserData.avatar = {
            public_id:"this is a sample id",
            url:myCloud.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
    })
})
// get all users
exports.getAllUser = Asyncerror(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    })
})
// get user details (admin)
exports.getSingleUser = Asyncerror(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        user
    })
})
//update USer role
exports.updateUserRole  = Asyncerror(async (req, res, next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
    })
})
//delete User 
exports.deleteUser = Asyncerror(async (req, res, next) => {
   console.log(req.params.id)
    const user = await User.findByIdAndUpdate(req.params.id)
    if(!user){ 
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`))
    }
    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
    })
})