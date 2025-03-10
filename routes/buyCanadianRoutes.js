"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const path = require("path");
router.get("/buy-canadian/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/buy-canadian/browser/index.html'));
});
exports.default = router;
