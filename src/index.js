
import dotenv from 'dotenv'
dotenv.config({path:'./.env'})
import { connectDb } from './db/index.js'
import { app } from './app.js'
// Load environment variables from .env file
 

const PORT = process.env.PORT || 5173
connectDb().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port 'http://localhost:${PORT}'`)
    })
 
}).catch((err)=>{
    console.error(`Error connecting to MongoDB: ${err.message}`)
    process.exit(1)  // Exit process with failure status
})
 

 
 
