import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {User}  from "../models/user.model.js"
import { Tweet } from "../models/tweet.model.js"
/*const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    // TODO: toggle like on video
    
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(401, "Unauthorized request")
    }
    
    const like = await Like.findOne({
        video: videoId,
        user: user._id
    })
    if(!like){
        const likeCreated = await Like.create({
            video: videoId,
            user: user._id
        })

        return new ApiResponse(200, likeCreated,"liked video successfully")

    }
    else{
        await like.remove()
        return new ApiResponse(200, null,"not liked video successfully")
    }


}) */

/*const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the user is authenticated
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Check if the user has already liked the video
    const like = await Like.findOne({
        video: videoId,
        user: user._id,
    });

    if (!like) {
        // If not liked, create a new like
        const likeCreated = await Like.create({
            video: videoId,
            user: user._id,
        });

        return new ApiResponse(200, likeCreated, "Liked video successfully");
    } else {
        // If already liked, remove the like
        await like.remove();
        return new ApiResponse(200, null, "Unliked video successfully");
    }
}); */

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if the video exists
        const video = await Video.findById(videoId).session(session);
        if (!video) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(404, "Video not found");
        }

        // Check if the user is authenticated
        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(401, "Unauthorized request");
        }

        // Check if the user has already liked the video
        const like = await Like.findOne({
            video: videoId,
            user: userId,
        }).session(session);

        if (!like) {
            // If not liked, create a new like
            const likeCreated = await Like.create(
                [{
                    video: videoId,
                    user: userId,
                }],
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({ message: "Liked video successfully", data: likeCreated });
        } else {
            // If already liked, remove the like
            console.log(`Like found: ${like}`);  // Log the found like

            const result = await Like.deleteOne({ _id: like._id }).session(session);
            console.log(`Deletion result: ${JSON.stringify(result)}`);  // Log the deletion result

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({ message: "Unliked video successfully" });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error toggling like for video ${videoId} by user ${userId}:`, error);
        throw error;
    }
});




const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(401, "Unauthorized request")
    }
    
    const like = await Like.findOne({
        comment: commentId,
        user: user._id
    })
    if(!like){
        const likeCreated = await Like.create({
            comment: commentId,
            user: user._id
        })
        return new ApiResponse(200, likeCreated,"liked comment successfully")
}

else{
   await like.remove()
    return new ApiResponse(200, null,"not liked video successfully")
}

}
)

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(401, "Unauthorized request")
    }
    
    const like = await Like.findOne({
        tweet: tweetId,
        user: user._id
    })
    if(!like){
        const likeCreated = await Like.create({
            tweet: tweetId,
            user: user._id
        })
        return new ApiResponse(200, likeCreated,"liked tweet successfully")
    }
    else{
       await like.remove()
        return new ApiResponse(200, null,"not liked tweet successfully")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    //TODO: get all liked videos
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "Unauthorized request");
    }
    const result = await User.aggregate([
        {$match:{_id:new mongoose.model.Types.ObjectId(user._id)}},
        {$lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"likedBy",
            as:"likedVideos",
            pipeline:[
                {$lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
                        {$project:{
                            _id:1,
                            username:1,
                            fullname:1,
                            avtar:1
                        }}
                    ]

                }},
                {
                    $addFields:{
                       owner: { $first:"$owner"}
                    }
                }

            ]
           
        }}
    ])


    return res.status(200).json(new ApiResponse(200,result,"fetch liked video successfully"));
})


 

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}