import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config();
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        maxlength:30,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        
    },
    fullname:{
        type:String,
        required:true,
        maxlength:50,
    },
    password:{
        type:String,
       
   
       
    },
    watchHistory:{
         type:[mongoose.Schema.Types.ObjectId],
         ref:'Video'


    },
    coverImg:{
        type:String,
     
    }
    ,
    avtar:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String,
        default:undefined,
    }


},{timestamps:true});

// userSchema.pre("save",async function (next){
//     if(!this.isModified("password")) return next()
//     this.password = await bcrypt.hash(this.password,10)
//     next()
//   })/// this will run just before the data save in db

//   userSchema.methods.isPasswordCorrect = async function(password){
//     return  await bcrypt.compare(password,this.password)
//  }


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
}); 

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


 userSchema.methods.generateAccessToken =  function (){
    console.log(process.env.ACESS_TOKEN_SECRET)
     return    jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email
         
        }
        ,
        process.env.ACESS_TOKEN_SECRET,
        { expiresIn:process.env.ACESS_TOKEN_EXPIRY }
    )
    
    
 }
 userSchema.methods.generateRefreshToken =  function(){
    return  jwt.sign(
        {
            _id:this._id,
           

        }
        ,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn:process.env.REFRESH_TOKEN_EXPIRY }
    )
 }

export const User = mongoose.model('User',userSchema);
