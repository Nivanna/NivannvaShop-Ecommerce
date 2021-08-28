const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const errorMiddleware = require('./middlewares/error');

app.use(express.json());
app.use(cookieParser());

//Route
//product route
const productRoute = require('./routes/product');
app.use('/api/v1', productRoute);

//user route
const userRoute = require('./routes/user');
app.use('/api/v1', userRoute);

//order route
const orderRoute = require('./routes/order');
app.use('/api/v1', orderRoute);

//using error handler middleware
app.use(errorMiddleware);
module.exports = app;