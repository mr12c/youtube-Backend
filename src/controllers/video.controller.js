import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  pipeline = [
    {
      $lookup: {
        from: "users",

        foreignField: "_id",
        localField: "createdBy",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }],
      },
    },
    {
      $addFields: {
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
      },
    },
    // Sort comments by creation date (descending order)
    { $sort: { createdAt: -1 } },
    // Project only the required fields from the 'comments' collection
    { $project: {} },
  ];

  if (query) {
    pipeline.push({ $match: { $text: { $search: query } } });
  }

  // If a userId is provided, add a match stage
  if (isValidObjectId(userId) && userId) {
    pipeline.push({ $match: { owner: mongoose.Types.ObjectId(userId) } });
  }

  // Sorting stage
  pipeline.push({ $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } });

  const aggregateQuery = Comment.aggregate(pipeline);

  // Define pagination options
  const options = {
    page: pageNumber,
    limit: limitNumber,
  };

  // Use the aggregatePaginate method for pagination
  const result = await Comment.aggregatePaginate(aggregateQuery, options);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "video fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description)
    throw new ApiError(404, "title and description are required");
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  const videoLocalPath = req.files?.video[0].path;
  if (!thumbnailLocalPath || !videoLocalPath) {
    throw new ApiError(400, "thumbnail and video are required");
  }
  const thumbnailCloud = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailCloud?.url) throw new ApiError(500, "Error uploading images");

  const videoCloud = await uploadOnCloudinary(videoLocalPath);
  if (!videoCloud?.url) throw new ApiError(500, "Error uploading video");
  const duration = videoCloud?.duration;
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnailCloud.url,
    url: videoCloud.url,
    createdBy: user._id,
    duration,
  });
  const createdVideo = await Video.findById(video.id);
  if (!createdVideo) throw new ApiError(500, "erro while creating video");
  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "video created successfully"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const videos = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "createdBy",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
        likes: { $size: "$likes" },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        url: 1,
        owner: 1,
        likes: 1,
        isPublished: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos[0], "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const foundVideo = await Video.findById(videoId)
  if(foundVideo.created_by.toString()!==user._id.toString()){
    throw new ApiError(403, "You are not authorized to update this video");
  }
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }
  const thumbnailLocalUrl = req.files.thumbnail[0].path;
  if (!thumbnailLocalUrl) {
    throw new ApiError(400, "thumbnail is required");
  }
  const thumbnailCloud = await uploadOnCloudinary(thumbnailLocalUrl);
  if (!thumbnailCloud?.url) {
    throw new ApiError(500, "Error uploading thumbnail");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
        title,
        description,
        thumbnail: thumbnailCloud.url,
      },
      { new: true }
    )

  
    return res
     .status(200)
     .json(new ApiResponse(200, video, "video updated successfully"));
   

  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const foundVideo = await Video.findById(videoId)
  if(foundVideo.created_by.toString()!==user._id.toString()){
    throw new ApiError(403, "You are not authorized to delete this video");
  }
  await Video.findByIdAndDelete(videoId);
  return res.status(200).json(new ApiResponse(200,{},"video Deleted Successfully"))
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const foundVideo = await Video.findById(videoId)
  if(!(foundVideo?.created_by?.toString()!==user._id?.toString())){
    throw new ApiError(403, "You are not authorized to update this video");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { isPublished:!foundVideo.isPublished },
    { new: true }
  ).select(["-likes -dislike  -createdAt -updatedAt"]);
  return res.status(200).json(new ApiResponse(200, updatedVideo,"MISSON SUCCESSFUL"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
