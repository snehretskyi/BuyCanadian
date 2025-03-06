// app.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Tesseract from 'tesseract.js';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {Jimp, JimpMime} from 'jimp';
import Quagga from '@ericblade/quagga2';
import {UpcService} from './services/upc.service';

interface UpcResult {
  manufacturer: string;
  country: string;
  countryCode: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Buy Canadian';
  upcInput = '';
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage = '';
  scanResult: UpcResult | null = null;

  constructor(private http: HttpClient, private upcService:UpcService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.processImage();
    }
  }

  async processImage(): Promise<void> {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.scanResult = null;

    try {
      const preprocessedImage = await this.preProcessImage(this.selectedFile);
      const preProcessedImageFile = new File(
        [preprocessedImage],
        'preProcessedImage.png',
        { type: 'image/png' }
      );
      const imageUrl = URL.createObjectURL(preProcessedImageFile);

      try {
        const upcCode = await this.scanBarcode(preProcessedImageFile) ?? "";

        // const imgElement = document.createElement('img');
        // imgElement.src = imageUrl;
        // document.body.appendChild(imgElement);
        const upcMatch = upcCode.match(/\d{12}/);

        if (upcMatch) {
          this.upcInput = upcMatch[0];
          this.lookupUpc();
        } else {
          this.errorMessage = 'No UPC code detected in image';
        }
      } catch (e) {
        this.errorMessage = "No UPC found!";
      }



    } catch (error) {
      this.errorMessage = 'Error processing image';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  lookupUpc(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.upcService.getUpcInfo(this.upcInput).subscribe(upcResult => {this.scanResult = upcResult;})
  }

  // need to preprocess for best results
  async preProcessImage(file:File):Promise<Buffer> {
    try {
      // could do via canvas, but why?
      const imageUrl = URL.createObjectURL(file);
      const image = await Jimp.read(imageUrl);
      image.greyscale();
      image.contrast(0.75);

      // Binarize the image (convert to black and white)
      image.threshold({ max: 128, autoGreyscale: false });

      return await image.getBuffer(JimpMime.png);

    } catch (e) {
      console.error('Oopsie daisy while preprocessing!:', e);
      throw e;
    }

  }

  scanBarcode(imageFile: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      Quagga.decodeSingle(
        {
          src: URL.createObjectURL(imageFile),
          numOfWorkers: 0, // Use 0 for auto-detection
          inputStream: {
            size: 800, // Adjust based on image size
          },
          decoder: {
            readers: ['upc_reader'], // Specify UPC reader
          },
          locator: {
            halfSample: true,
            patchSize: 'medium', // Adjust for better detection
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

  getCountryEmoji(countryCode: string): string {
    // convert country code to emoji flag
    return String.fromCodePoint(...countryCode
      .toUpperCase()
      .split("")
      // flag emoji a - unicode a (65)
      .map(char => 127397 + char.charCodeAt(0)))
  }
}
