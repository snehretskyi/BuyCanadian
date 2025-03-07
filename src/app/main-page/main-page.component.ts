import {Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UpcService} from '../services/upc.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Jimp, JimpMime} from 'jimp';
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

  constructor(private http: HttpClient, private upcService:UpcService, private Route: ActivatedRoute, private router: Router, private fb:FormBuilder) {
    this.scanForm = this.fb.group({
      upcInput: ['', [Validators.required, Validators.pattern(/^\d{12}$/), Validators.maxLength(12)]]
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    // need to also set it here
    this.isLoading = true;
    if (this.selectedFile) {
      this.processImage();
    }
  }

  async processImage(): Promise<void> {
    if (!this.selectedFile) return;

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
        this.isLoading = false;
      }



    } catch (error) {
      this.errorMessage = 'Error processing image';
      console.error(error);
    }
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
      console.error('Oopsie daisy while preprocessing!', e);
      throw e;
    }

  }

  scanBarcode(imageFile: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      Quagga.decodeSingle(
        {
          src: URL.createObjectURL(imageFile),
          numOfWorkers: 0,
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

  openCamera() {
    document.getElementById('file-input')!.click()
  }

  protected readonly alert = alert;
  protected readonly close = close;
}
