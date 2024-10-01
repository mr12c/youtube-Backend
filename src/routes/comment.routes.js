import Router from "express";
 
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createComment,deleteComment,updateComment,getVideoComments } from "../controllers/comment.controller.js";



const router = Router()



router.route("/createComment/:videoId").post(verifyJWT,createComment)
router.route("/deleteComment/:videoId").post(verifyJWT,deleteComment)
router.route("/updateComment/:videoId").patch(verifyJWT,updateComment)
router.route("/videoComments/:videoId").post(getVideoComments)

export default router;


