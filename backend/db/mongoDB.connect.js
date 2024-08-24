import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("database connected successfully");
        // ${conn.connection.host}
    } catch(err) {
        console.log(`Error connection to mongoDB: ${err.message}`);
        process.exit(1);
    }
}

export default connectMongoDB;