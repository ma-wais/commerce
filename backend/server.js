const app= require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const cloudinary = require('cloudinary');
//handling uncought exceptions
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncought exception`);
    process.exit(1);
})
// Handling Config 
dotenv.config({path: 'backend/config/config.env'});
//connecting database 
connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is up on port ${process.env.PORT}`);
})
//unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);
    server.close(() => {
        process.exit(1);
    })
})