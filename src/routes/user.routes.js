import { Router } from "express";
import { registerUser,
    loginUser,logoutUser
    , updateAvatar
    , updateCoverImg,
     changeCurrentPassword,
      currentUser, 
      updateUser,
      getUserChannel,
      getWatchHistory,
    refreshAccessToken,
    getTweets} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/mullter.js";
const router = Router(
  
   
);

router.route("/register").post(upload.fields([{
    name:"avtar",
    maxCount: 1
},{
    name:"cover_Img",
    maxCount: 1
}]),registerUser)

router.route("/login").post(loginUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/updateAvtar").patch(verifyJWT,upload.single("avtar"),updateAvatar)
router.route("/updataCoverImage").patch(verifyJWT,upload.single("cover_Img"),updateCoverImg)
router.route("/changePassword").patch(verifyJWT,changeCurrentPassword)
router.route("/currentUser").get(verifyJWT,currentUser)
router.route("/updateprofile").patch(verifyJWT,updateUser)
router.route("/channel/:username").get(verifyJWT,getUserChannel)
router.route(
  "/watchHistory/:username"
).get(verifyJWT,getWatchHistory)

router.route("/tweets").get(verifyJWT,getTweets)


export default router;