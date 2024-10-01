import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const playlist = await Playlist.create({
        name,
        description,
        createdBy: user._id
    })

    const createdPlayList = await Playlist.findById(playlist._id)
    if(!createdPlayList){
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201).json(new ApiResponse(201, createdPlayList, "Playlist created successfully"))






    
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    //TODO: get user playlists
    const results = await Playlist.aggregate([
        {$match:{createdBy:new mongoose.Model.Types.ObjectId(userId)}},
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"videos",
                as:"videos",
                pipeline:[
                    {$lookup:{
                        from:"users",
                        localField:"createdBy",
                        foreignField:"id",
                        as:"owner",
                        pipeline:[
                            {$project:{
                                _id:1,
                                username:1,
                                fullname:1,
                                avtar:1
                            }}
                        ]
                    }}
                    ,{
                        $addFields:{
                            owner:{
                                $arrayElemAt:["$owner", 0]
                            }
                        }
                    }
                ]
            }
        },
        {$lookup:{
            from:"users",
            localField:"createdBy",
            foreignField:"_id",
            as:"createdBy",
            pipeline:[
                {$project:{
                    _id:1,
                    username:1,
                    fullname:1,
                    avtar:1
                }}
            ]
        }}
    ])
    
    return res.json(new ApiResponse(200, results, "User playlists fetched successfully"))


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    console.log(playlistId)
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const playlists = await Playlist.aggregate([
        {$match:{_id:new mongoose.Types.ObjectId(playlistId)}},
        {$lookup:{
            from:"videos",
            foreignField:"_id",
            localField:"videos",
            as:"videos",
            pipeline:[
                {$lookup:{
                    from:"users",
                    localField:"createdBy",
                    foreignField:"id",
                    as:"owner",
                    pipeline:[
                        {$project:{
                            _id:1,
                            username:1,
                            fullname:1,
                            avtar:1
                        }}
                    ]
                }}
                ,{
                    $addFields:{
                        owner:{
                            $arrayElemAt:["$owner", 0]
                        }
                    }
                }
            ]   

        }}
    ])

    return res.status(200).json(new ApiResponse(200,playlists[0],"playlist fetched successfully"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
     }
     const user = await User.findById(req.user?.id)
     if(!user){
        throw new ApiError(401, "Unauthorized request  t")

     }
     const findplaylist = await Playlist.findById(playlistId)

     if(user._id.toString()!== findplaylist.createdBy.toString() ){
        throw new ApiError(401, "Unauthorized request ie. you are not authorized to add video")
     }
     const playlist = await Playlist.findByIdAndUpdate(playlistId, {$push:{videos:videoId}}, {new:true})

     return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
  
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if(!isValidObjectId(playlistId) ||!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
     }
     const user = await User.findById(req.user?.id)
     if(!user){
        throw new ApiError(401, "Unauthorized request  t")
     }
     const findplaylist = await Playlist.findById(playlistId)
     if(user._id.toString()!== findplaylist.createdBy.toString() ){
        throw new ApiError(401, "Unauthorized request ie. you are not authorized to remove video")
     }

     const playlist = await Playlist.findByIdAndUpdate(playlistId, {$pull:{videos:videoId}}, {new:true})
     return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401, "Unauthorized request  t")
    }
    const findplaylist = await Playlist.findById(playlistId)
    if(user._id.toString()!== findplaylist.createdBy.toString() ){
        throw new ApiError(401, "Unauthorized request ie. you are not authorized to delete playlist")
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200,{}, "Playlist deleted successfully"))
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const {name, description} = req.body
    if(!name ||!description){
        throw new ApiError(400, "Name and description are required")
    }
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401, "Unauthorized request  t")
    }
    const findplaylist = await Playlist.findById(playlistId)
    if(user._id.toString()!== findplaylist.createdBy.toString() ){
        throw new ApiError(401, "Unauthorized request ie. you are not authorized to update playlist")
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId, {$set:{name, description}}, {new:true})
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"))
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}



