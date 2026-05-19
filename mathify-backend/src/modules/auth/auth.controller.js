import {signupService,loginService} from "./auth.service.js" ;

export const signup = async (req , res) => {
    try {
        const result = await signupService(req.body) ;

        res.status(201).json({
            success : true ,
            message : "User created" ,
            data : result 
        }) ;
    }
    catch(err){
        res.status(400).json({
            success:false ,
            message: err.message 
        });
    }
};

export const login = async (req,res) => {
    try {

        const result = await loginService(req.body);

        res.status(200).json({
            success:true,
            message:"Login success",
            data:result
        });

    }
    catch(err){

        res.status(400).json({
            success:false,
            message:err.message
        });

    }
};