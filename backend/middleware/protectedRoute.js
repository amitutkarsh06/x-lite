import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; //typo cookies
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // await typo

        if (!decoded) {
            return res.status(401).json({ error: "unauthorizred: invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ error: "user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error in protectedRoute middleware", error.message);
        return res.status(500).json({ error: "internal server error" });
    }
}