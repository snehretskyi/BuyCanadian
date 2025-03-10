import {Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UpcService} from '../services/upc.service';
import {ActivatedRoute, Router} from '@angular/router';
import Quagga from '@ericblade/quagga2';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { NgIf} from '@angular/common';
import {UpcItem} from '../models/upc-item';
import {UpcNotFoundError} from '../models/errors/UpcNotFoundError';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgbAlert
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  scanForm:FormGroup;
  upcInput = '';
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage = '';
  inputMode: 'text' | 'image' = 'image';
  scanResult: UpcItem | null = null;
  @ViewChild('cameraInput') cameraInput!: ElementRef;

  constructor(private http: HttpClient, private upcService:UpcService, private Route: ActivatedRoute, private router: Router, private fb:FormBuilder) {
    this.scanForm = this.fb.group({
      upcInput: ['', [Validators.required, Validators.pattern(/^\d{12}$/), Validators.maxLength(12)]]
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    // need to also set it here
    this.isLoading = true;

    if (!this.selectedFile) {
      this.isLoading = false;
      return;
    }

    // must be image
    if (!this.selectedFile.type.match('image.*')) {
      this.errorMessage = "Please select an image file (JPEG, PNG, etc.)";
      event.target.value = '';
      this.isLoading = false;
      return;
    }

    if (this.selectedFile) {
      this.processImage();
    }
  }

  async processImage(): Promise<void> {
    if (!this.selectedFile) return;

    this.errorMessage = '';
    this.scanResult = null;

    const upc = this.upcService.uploadAndScanImage(this.selectedFile).subscribe(
      {
        next: result => {
          this.upcInput = result;
          this.lookupUpc();
        },
        error: e => {
          this.errorMessage = 'No UPC code detected in image!';
          this.isLoading = false;
          console.error(e);
        }
      }
    )
  }

  lookupUpc(): void {
    if (this.scanForm.valid || this.inputMode == 'image') {
      this.isLoading = true;
      this.errorMessage = '';

      if (this.scanForm.controls['upcInput'].valid) {
        this.upcInput = this.scanForm.controls['upcInput'].value;
      }

      this.upcService.getUpcInfo(this.upcInput).subscribe({
        next: (upcResult) => {
          // always wanted to try local storage :)
          localStorage.setItem('scanResult', JSON.stringify(upcResult));
          localStorage.setItem('upcCode', this.upcInput);

          // navigate to result page
          this.router.navigate(['/result']);
          this.isLoading = false;
        },
        error: (e) => {
          if (e instanceof UpcNotFoundError) {
            this.errorMessage = e.message;
          } else  {
            this.errorMessage = 'Error looking up UPC';
          }

          this.isLoading = false;
          console.error(e);
        }
      });
    } else {
      this.errorMessage = "UPC must be a sequence of 12 numbers"
    }

  }

  // need to preprocess for best results
  async preProcessImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          // Resize to reasonable dimensions
          const maxWidth = 1000;
          const maxHeight = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            } else {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw the image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Get image data to manipulate pixels
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          // Convert to grayscale
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
          }

          // Increase contrast
          const factor = 1.5; // contrast factor
          for (let i = 0; i < data.length; i += 4) {
            const value = data[i];
            data[i] = data[i + 1] = data[i + 2] =
              Math.min(255, Math.max(0, factor * (value - 128) + 128));
          }

          // Apply threshold (binarize the image)
          const threshold = 128;
          for (let i = 0; i < data.length; i += 4) {
            const value = data[i] > threshold ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = value;
          }

          // Put the modified data back on the canvas
          ctx.putImageData(imageData, 0, 0);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }

            // Clean up to free memory
            URL.revokeObjectURL(img.src);
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = URL.createObjectURL(file);
    })};

  scanBarcode(imageFile: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const imageUrl = URL.createObjectURL(imageFile);
      Quagga.decodeSingle(
        {
          src: imageUrl,
          numOfWorkers: Math.min(navigator.hardwareConcurrency || 4, 2) ,
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
          URL.revokeObjectURL(imageUrl);
          if (result?.codeResult?.code) {
            resolve(result.codeResult.code);
          } else {
            reject(new Error('No barcode detected'));
          }
        }
      );
    });
  }

  openCamera() {
    this.cameraInput.nativeElement.click();
  }

  protected readonly alert = alert;
  protected readonly close = close;
}
