const { publishToQueue } = require("../service/rabbit");
const rideModel=require('../model/ride.model');


const createRide=async(req,res)=>{
    try{
        const { pickup, destination } = req.body;
        const newRide = new rideModel({
            user: req.user._id,
            pickup,
            destination
        })
    
    
    
        await newRide.save();
        publishToQueue("new-ride", JSON.stringify(newRide));
        res.send(newRide);  
    }
    catch(error){
        res.status(500).json({message:"Error in Creating a Ride",error:error.message});
    }
}

const acceptRide=async(req,res)=>{
    try{
        const { rideId } = req.query;
        const ride = await rideModel.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }
        ride.status = "accepted";
        await ride.save();

        publishToQueue("ride-accepted", JSON.stringify(ride))
        res.send(ride);
    }
    catch(error){
        res.status(500).json({message:"Error in Accepting a Ride",error:error});
    }
}

module.exports= {createRide,acceptRide};