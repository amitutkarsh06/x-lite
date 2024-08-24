import express from "express";
import dotnev from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/mongoDB.connect.js";

dotnev.config();

const app = express();
const PORT = process.env.PORT | 5000;

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
    connectMongoDB();
})
