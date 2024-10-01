import Router from 'express'
import { createPlaylist, getPlaylistById, updatePlaylist,deletePlaylist, removeVideoFromPlaylist, addVideoToPlaylist } from '../controllers/playlist.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
const router  = Router()


router.route('/:playlistId').get(getPlaylistById)
router.route('/createPlaylist').post(verifyJWT,createPlaylist)
router.route('/addVideoToPlaylist/:playlistId/:videoId').post(verifyJWT,addVideoToPlaylist)
 
router.route('/updatePlaylist/:playlistId').post(verifyJWT,updatePlaylist)
router.route('/removeVideoFromPlaylist/:playlistId/:videoId').post(verifyJWT,removeVideoFromPlaylist)
router.route('/deletePlaylist/:playlistId').post(verifyJWT,deletePlaylist)

export default router