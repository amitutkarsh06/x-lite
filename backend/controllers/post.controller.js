import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";


export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;

        const userId = user._id.toString();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "user not found" });

        if (!text && !img) {
            return res.status(400).json({ error: "post must have text or image" });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        
        const newPost = new Post({
            user: userId.
                text,
            img
        });

        await newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        console.log("error in createPost controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }

}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) return res.status(404).json({ error: "post not found" });

        if (post.user.toString() !== req.user._id) {
            return res.status(401).json({ error: "you are not authorized to delete the post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({ message: "post deleted successfully" });
    } catch (error) {
        console.log("error in deletePost controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const { id: postId } = req.params;

        if (!text) {
            return res.status(400).json({ error: "text field is required" });
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "post not found" });
        }

        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
          
    } catch (error) {
        console.log("error in commentPost controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "post not found" });
        }

        const userLikedPost = await Post.likes.includes(userId);

        if (userLikedPost) {
            //unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            res.status(200).json({ message: "post unliked successfully" });
        }
        else {
            //like a post

            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();

            res.status(200).json({ message: "post liked successfully" });
        }

    } catch (error) {
        console.log("error in likePost controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        })
            .populate({
                path: "comments.user",
                select: "-password"
        })

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("error in getAllPosts controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

export const getLikedPosts = async (req, res) => {
    const { id: userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password"
            }).populate({
                path: "comments.user",
                select: "-password"
            });
        
        res.status(200).json(likedPosts);
    } catch (error) {
         console.log("error in getLikedPosts controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            }).populate({
                path: "comments.user",
                select: "-password"
            })
        
        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("error in getFollowingPosts controller", error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const Posts = await Post.find({user: user._id})
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            }).populate({
                path: "comments.user",
                select: "-password"
            })
        
        res.status(200).json(Posts);
    } catch (error) {
        console.log("erorr in getUserPosts controller", errror.message);
        res.status(500).json({ error: "internal server error" });
    }
}