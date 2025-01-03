const express=require('express');
const router= express.Router();


const {register, login, logout, profile, acceptedRide}= require('../controller/user.controller');
const {userAuth}= require('../middleware/auth');

router.post('/register', register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/profile',userAuth,profile);
router.get('/accepted-ride',userAuth,acceptedRide);






module.exports=router;
