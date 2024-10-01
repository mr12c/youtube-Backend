import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Tweet } from '../models/tweet.model.js';  
import ApiResponse from '../utils/ApiResponse.js';



const createTweet = asyncHandler(
    async (req, res) => {
        const { content } = req.body;
        if (!content) {
            throw new ApiError(400,'Content is required');
        }
        const user = await User.findById(req.user?._id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        const tweet = await Tweet.create({ content, user: user._id });
        tweet.createdBy = user._id;
         await  tweet.save({validateBeforeSave: false});
        const createdTweet = await Tweet.findById(tweet._id).select(["-created_by"])
        if(!createdTweet ){
            throw new ApiError(500, 'Failed to create tweet');
        }
        return res.status(200).json(new ApiResponse(200,{sucsess:true, tweet:createdTweet},"tweet created successfully"));

    }
)


const updateTweet = asyncHandler(
    async(req,res)=>{
        const { tweetId } = req.params;
        const { content } = req.body;
        const user = await User.findById(req.user?._id);
         
        if(!user){
            throw new ApiError(404,"User not found")
        }
        if(!content){
            throw new ApiError(400,"Content is required")
        }
        const tweet = await Tweet.findById(tweetId);
        if(!tweet) {
            throw new ApiError(404,"Tweet not found")
        }
        console.log(tweet.createdBy ,user._id)
        if(tweet.createdBy.toString() !== user._id.toString() ){
            throw new ApiError(403,"You are not authorized to update this tweet")
        }
        const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{
            $set:{
                content
            }
        }, {new:true})
        if(!tweet){
            throw new ApiError(500,"error while updating tweet")
        }
        return res.status(200).json(new ApiResponse(200,{sucsess:true, tweet:updatedTweet},"tweet updated successfully"))
        
    }
)


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = await User.findById(req.user?._id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    console.log(tweet.createdBy,user._id)
    if (tweet.createdBy.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
   
    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200, { success: true }, "Tweet deleted successfully"));
});





export {createTweet,updateTweet,deleteTweet}  


