import upload from "../middlewares/mullter.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 
import { Router } from "express";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";



const router = Router();


router.route("/uploadVideo/:videoId").patch(verifyJWT,upload.fields([
    {name:'thumbnail',maxCount:1},
    {name:'video',maxCount:1}
]),publishAVideo)
router.route("/:videoId").get(verifyJWT,getVideoById)
router.route("/toggleVisiblity/:videoId").patch(verifyJWT,togglePublishStatus)
router.route("/deleteVideo/:videoId").post(verifyJWT,deleteVideo)
router.route("/updateVideo/:videoId").patch(verifyJWT,updateVideo)

export default router;