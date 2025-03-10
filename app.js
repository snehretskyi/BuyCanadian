"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const barcodeRoutes_1 = __importDefault(require("./routes/barcodeRoutes"));
const buyCanadianRoutes_1 = __importDefault(require("./routes/buyCanadianRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use("/buy-canadian", express_1.default.static(path_1.default.join(__dirname, 'public/buy-canadian/browser')));
app.use("/buy-canadian", buyCanadianRoutes_1.default);
app.use('/api', barcodeRoutes_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
