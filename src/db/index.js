import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const connectDb = async ()=>{
    try{
      const connectionInstance =  await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
      console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`)
    }
    catch(error){
      console.error(`Error connecting to MongoDB: ${error.message}`)
      process.exit(1)
    }
}