const jwt=require('jsonwebtoken');
const axios=require('axios');


const userAuth= async(req,res,next)=>{
    try {
        const token= req.cookies.token || req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(401).json({message:'Unauthorized'});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        
        const user= await axios.get(`${process.env.BASE_URL}/user/profile`,{
            headers:{
                authorization:`Bearer ${token}`
            }
        })


        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }


       req.user=user.data;

        next();
        
    } catch (error) {
        res.status(500).json({message:"Error in Authentication Middleware",error:error.message});
    }
}

const captainAuth=async(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(' ')[ 1 ] ||req.cookies.token ;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized Token not found' });
        }

       // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const response = await axios.get(`${process.env.BASE_URL}/captain/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })


        const captain = response.data;

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized captain do not exists' });
        }

        req.captain = captain;
        next();

    }
    catch (error) {
        res.status(500).json({ message: error.message,error:error.message });
    }
}

module.exports={userAuth,captainAuth};