import mongoose  from "mongoose";


const subsSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

},{timestamps:true})



export const Subs = mongoose.model('Subs',subsSchema);


