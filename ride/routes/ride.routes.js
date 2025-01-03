const express= require('express');
const router= express.Router();

const {userAuth, captainAuth}= require('../middleware/auth');
const {createRide, acceptRide}=require('../controller/ride.controller')

router.post('/create-ride',userAuth,createRide);
router.put('/accept-ride',captainAuth,acceptRide);


module.exports=router;

