import Router from "express"
import { deleteSubscription, getSubscription } from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"



const router = Router()


router.route("/subscirbe").post(verifyJWT,getSubscription)
router.route("/deleteSubscription").post(verifyJWT,deleteSubscription)


export default router;