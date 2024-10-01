import mongoose from "mongoose";


const playlistSchema  = new mongoose.Schema({
      name:{
        type:String,
        required:true,
        maxlength:50,
         
      },
      videos:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Video',
      
      },
      createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
      },



},{timestamps:true})


export const Playlist = mongoose.model('Playlist', playlistSchema);
