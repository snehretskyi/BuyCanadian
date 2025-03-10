import express from "express";
const router = express.Router();
const path = require("path");

router.get("/buy-canadian/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/buy-canadian/browser/index.html'));
});

export default router;
