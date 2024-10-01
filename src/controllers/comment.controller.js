import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createComment = asyncHandler(async()=>{
    const {content} = req.body
    const {videoId} = req.params
    if(!content?.trim()){
        throw new ApiError(400,'Content is missing')
    }

     const video = await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,'Video not found')
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        createdBy: req.user._id
    })
    const createdComment = await Comment.findById(comment._id).select(["-content createdBy "])
    if(!createdComment){
        throw new ApiError(500,'Failed to create comment')
    }
  return   res.status(201).json(new ApiResponse(201,createdComment,"Comment created successfully"))

})


const updateComment = asyncHandler(async(req,res)=>{
    const {commentId, content} = req.body
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,'Invalid comment ID')
    }
    if( !content) {
        throw new ApiError(400,'content is required')
    }
    
    
    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,'Comment not found')
    }

    if(comment.createdBy.toString()!== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to update this comment')
    }

    comment.content = content;
    await comment.save({validateBeforeSave:false})


    const updatedComment = await Comment.findById(commentId).select(["-content createdBy "])
    if(!updatedComment){
        throw new ApiError(500,'Failed to update comment')
    }
    return res.status(200).json(new ApiResponse(200,{sucsess:true, comment:updatedComment},"comment updated successfully"))
})

const deleteComment = asyncHandler(async (req,res) => {
    const {commentId} = req.body
    if(!commentId){
        throw new ApiError(400,'Comment ID is missing')
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,'Comment not found')
    }
    if(comment.createdBy.toString()!== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to delete this comment')
    }
    await comment.remove()
    return res.status(200).json(new ApiResponse(200,{sucsess:true},"comment deleted successfully"))
 
})

const getVideoComments = asyncHandler(async(req,res) =>{
    const {videoId} = req.params 
    if(!videoId?.trim()){
        throw new ApiError(400,'Video ID is missing')
    }
    const video = await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,'Video not found')  // if video not found return error 404  and message Video not found
       }
    const {page=1,limit=10} = req.query
    const pageNumber = parseInt(page,10)
    const limitNumber = parseInt(limit,10)



    const aggregateQuery = Comment.aggregate([
        { 
            // Match all comments for the given videoId
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        { 
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
                // Project only the required fields from the 'users' collection
                pipeline: [{ $project: { _id: 1, username: 1, fullname: 1, avtar: 1 } }]
            }
        },
        // Sort comments by creation date (descending order)
        { $sort: { createdAt: -1 } },
        // Project only the required fields from the 'comments' collection
        { $project: { content: 1, createdAt: 1, updatedAt: 1, createdBy: 1 } }
    ]);

    // Define pagination options
    const options = {
        page: pageNumber,
        limit: limitNumber
    };

    // Use the aggregatePaginate method for pagination
    const result = await Comment.aggregatePaginate(aggregateQuery, options);

    // Send the paginated comments along with pagination info in the response
    res.status(200).json(new ApiResponse(200, { totalPages: result.totalPages, comments: result.docs, pageNumber }, "Comments fetched successfully"));
});



export {
    createComment,
    updateComment,
    deleteComment,
    getVideoComments    
}