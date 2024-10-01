import {Subs} from "../models/subs.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const getSubscription  = asyncHandler(async(req,res)=>{
    const username = req.params
    const currentUser =  await User.findById(req.user?._id)
    if(!currentUser) {
        throw new Error(401,'Unauthorized request')
    }
    if(!username?.toLowerCase()) {
        throw new Error(400,'Username is required')
        
    }
    const channel = await User.findByUsername(username)
    if(!channel) {
        throw new Error(404,'Channel not found')
    }
    const subs = await Subs.create({
        subscriber: currentUser._id,
        channel: channel._id
    })
    const createdSubscription = await Subs.findById(subs._id)
    if(!createdSubscription) {
        throw new Error(500,'Failed to subscribe')
    }
   return  res.status(201).json({
        success: true,
        data: createdSubscription
    },"subscribed successfully")


})


const deleteSubscription = asyncHandler (async (req, res) => {
    const username = req.params
    const currentUser = await User.findById(req.user?._id)
    if(!currentUser) {
        throw new Error(401,'Unauthorized request')
    }
    if(!username?.toLowerCase()) {
        throw new Error(400,'Username is required')
    }
    const channel = await User.findByUsername(username)
    if(!channel) {
        throw new Error(404,'Channel not found')
    }
    const subscription = await Subs.findOneAndDelete({
        subscriber: currentUser._id,
        channel: channel._id
    })
    if(!subscription) {
        throw new Error(404,'Subscription not found')
    }
    return res.status(200).json({
        success: true,
        data: null
    },"unsubscribed successfully")
 
})

export { getSubscription, deleteSubscription }


