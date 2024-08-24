import express from "express";

const router = express.Router();

router.post("/signup", (req, res) => {
    res.json({
        data: "hello there from signup page",
    });
});

router.post("/login", (req, res) => {
    res.json({
        data: "hello there from signup page",
    });
});

router.post("/logout", (req, res) => {
    res.json({
        data: "hello there from signup page",
    });
});


export default router;