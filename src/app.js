import express from  'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url';
 
const app = express()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, './Public')));

app.use(cors(
    {orgin:process.env.CORS_ORGIN,
    Credential:true
    }
))  /// this will allow to send requests to all 
// required middelwares
app.use(cookieParser())
app.use(express.json({limit:"16kb"}))//// for getting the form data 
app.use(express.urlencoded({extended:true,limit:"16kb"}))  //// /for getting data from urlencoded extended is using for reading data from  nested objects also
app.use(express.static('Public'))

 

/// routes 
import userRouter from './routes/user.routes.js';

import subsRouter from './routes/subscription.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import videoRouter from './routes/video.routes.js';
import likeRouter from './routes/like.routes.js';
import commentRouter from './routes/comment.routes.js';
import playlistRouter from './routes/playlist.routes.js';
////routes declarations
app.use('/api/v1/users', userRouter);
app.use("/api/v1/subscriptions",subsRouter);
app.use('/api/v1/tweets', tweetRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/likes',likeRouter)
app.use('/api/v1/comments',commentRouter)
app.use('/api/v1/playlists',playlistRouter)
export {app}

