const express= require('express');
const app=express();

const dotenv= require('dotenv');
dotenv.config();

const cookieParser=require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const {connectDB}= require('./db/db');
connectDB();

const rabbitMq = require('./service/rabbit')
rabbitMq.connect();

const rideRoutes= require('./routes/ride.routes');
app.use('/',rideRoutes);

module.exports = app;