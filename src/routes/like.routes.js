import { toggleVideoLike } from "../controllers/like.controller.js";
 
import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route('/:videoId').post(verifyJWT,toggleVideoLike)




export default router;