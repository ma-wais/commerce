const mongoose = require('mongoose');

const connectDB =  () => {
    mongoose.connect(process.env.MONGO_URI,{ 
        dbName: 'ecommerce', 
        useNewUrlParser: true,
    }).then((data) => { 
        console.log(`Database connected with ${data.connection.host}`);
  }) .catch((err) => {
        console.log(err);
  }); 
} 

module.exports = connectDB;

