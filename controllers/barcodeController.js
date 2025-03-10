"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const JimpLibrary = __importStar(require("jimp"));
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const quagga2_1 = __importDefault(require("@ericblade/quagga2"));
const Jimp = JimpLibrary.Jimp;
// Controller to handle barcode scanning
exports.scanBarcode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tempFilePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const processedImageBuffer = yield preProcessImage(req.file.buffer);
        const tempDir = os.tmpdir();
        const fileName = `barcode-${(0, uuid_1.v4)()}.png`;
        tempFilePath = path.join(tempDir, fileName);
        fs.writeFileSync(tempFilePath, processedImageBuffer);
        const upcCode = yield scanBarcode(tempFilePath);
        const upcMatch = upcCode.match(/\d{12}/);
        if (upcMatch) {
            res.json({ upc: upcMatch[0] });
        }
        else {
            res.status(404).json({ error: 'No valid UPC code detected in image' });
        }
    }
    catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image: ' + error.message });
    }
    finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
});
exports.getStatus = (req, res) => {
    res.json({ status: 'ok', message: 'Barcode scanner service is running' });
};
function preProcessImage(imageBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield Jimp.read(imageBuffer);
            image.resize({ w: 1000 });
            image.greyscale();
            image.contrast(0.5);
            // Return as buffer
            return yield image.getBuffer(JimpLibrary.JimpMime.png);
        }
        catch (error) {
            console.error('Image processing error:', error);
            throw error;
        }
    });
}
function scanBarcode(filePath) {
    return new Promise((resolve, reject) => {
        quagga2_1.default.decodeSingle({
            src: filePath,
            numOfWorkers: 2,
            inputStream: {
                size: 800,
            },
            decoder: {
                readers: ['upc_reader'],
            },
            locator: {
                halfSample: true,
                patchSize: 'medium',
            },
        }, (result) => {
            var _a;
            if ((_a = result === null || result === void 0 ? void 0 : result.codeResult) === null || _a === void 0 ? void 0 : _a.code) {
                resolve(result.codeResult.code);
            }
            else {
                reject(new Error('No barcode detected'));
            }
        });
    });
}
