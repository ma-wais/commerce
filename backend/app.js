const express = require('express');
const ErrorMiddleware = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv'); 
const cors = require('cors');

//config
dotenv.config({path:'./config/config.env'})
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());

//middleware error
app.use(ErrorMiddleware)
//Route imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoutes');
const payment = require('./routes/paymentRoute');

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

module.exports = app;