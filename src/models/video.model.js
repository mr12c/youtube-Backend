import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 50,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 200,
    },
    url: {
        type: String,
        required: true,
    },
    thumbnail:{
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
 
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,          
        ref: 'Comment',
    }],
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model(
  'Video',
  videoSchema
)