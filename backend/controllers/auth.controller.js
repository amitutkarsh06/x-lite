import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
export const signup = async (req, res) => {
    try {
        const { fullname, username, password, email } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email Format" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "username is already taken" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "email is already taken" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "password must be at least 6 characters long" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
          
        const newUser = new User({
            fullname,
            email,
            username,
            password: hashedPassword
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        } else {
            res.status(400).json({error: "invalid user data"})
        }

    } catch (error) {
        console.log("error in signup controller", error.message);

        res.status(500).json({ error: "internal server error" });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "invalid username or password" });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })
        
    } catch (error) {
        console.log("error in login controller", error.message);

        res.status(500).json({ error: "Internal server error" });
    }
};


export const logout = async(req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "logged out successfully" });
    } catch (error) {
        console.log("error in logout controoler", error.message);
        res.status(500).json({
            error: "internal server error"
        })
     }
}

export const getMe = async (req, res) => {
    try {
        const me = await User.findById(req.user._id).select("-password");
        res.status(200).json(me);
        
    } catch (error) {
        console.log("error in getme controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

