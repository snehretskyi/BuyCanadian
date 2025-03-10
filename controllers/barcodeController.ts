import * as path from "node:path";
import * as os from "node:os";
import * as JimpLibrary from 'jimp';
import {v4 as uuidv4} from 'uuid';
import * as fs from 'fs';
import Quagga from '@ericblade/quagga2';

const Jimp =JimpLibrary.Jimp;

// Controller to handle barcode scanning
exports.scanBarcode = async (req:any, res:any) => {
    let tempFilePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const processedImageBuffer = await preProcessImage(req.file.buffer);

        const tempDir = os.tmpdir();
        const fileName = `barcode-${uuidv4()}.png`;
        tempFilePath = path.join(tempDir, fileName);

        fs.writeFileSync(tempFilePath, processedImageBuffer);

        const upcCode:string = await scanBarcode(tempFilePath);

        const upcMatch = upcCode.match(/\d{12}/);

        if (upcMatch) {
            res.json({ upc: upcMatch[0] });
        } else {
            res.status(404).json({ error: 'No valid UPC code detected in image' });
        }
    } catch (error:any) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image: ' + error.message });
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
};

exports.getStatus = (req:any, res:any) => {
    res.json({ status: 'ok', message: 'Barcode scanner service is running' });
};

async function preProcessImage(imageBuffer:Buffer):Promise<Buffer> {
    try {

        const image = await Jimp.read(imageBuffer);

        image.resize({w: 1000});

        image.greyscale();

        image.contrast(0.5);

        // Return as buffer
        return await image.getBuffer(JimpLibrary.JimpMime.png);
    } catch (error) {
        console.error('Image processing error:', error);
        throw error;
    }
}


function scanBarcode(filePath:string):Promise<string> {
    return new Promise((resolve, reject) => {
        Quagga.decodeSingle(
            {
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
            },
            (result) => {
                if (result?.codeResult?.code) {
                    resolve(result.codeResult.code);
                } else {
                    reject(new Error('No barcode detected'));
                }
            }
        );
    });
}