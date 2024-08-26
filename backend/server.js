import express from "express";
import dotnev from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/userRoutes.js";


import connectMongoDB from "./db/mongoDB.connect.js";

dotnev.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();
const PORT = process.env.PORT | 5000;

app.use(express.json()); //to parse request body 
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.uue("/api/users", userRoutes);


app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
    connectMongoDB();
})
