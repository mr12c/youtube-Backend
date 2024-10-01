import { Router } from "express";
import { createTweet,updateTweet,deleteTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();



router.route('/createTweet').post(verifyJWT,createTweet)
router.route('/updateTweet/:tweetId').post(verifyJWT,updateTweet)
router.route('/deleteTweet/:tweetId').post(verifyJWT,deleteTweet)


export default router;