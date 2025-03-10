"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const barcodeController = require('../controllers/barcodeController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
// Route to scan barcode from uploaded image
router.post('/scan-barcode', upload.single('image'), barcodeController.scanBarcode);
exports.default = router;
