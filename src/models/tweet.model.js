import mongoose from "mongoose";    

const tweetSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
        maxlength:500,
        },

    createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
},{timestamps:true})


export const Tweet = mongoose.model('Tweet', tweetSchema);