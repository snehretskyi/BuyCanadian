"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.MainPageComponent = void 0;
const core_1 = require("@angular/core");
const quagga2_1 = __importDefault(require("@ericblade/quagga2"));
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
const UpcNotFoundError_1 = require("../models/errors/UpcNotFoundError");
const ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
let MainPageComponent = class MainPageComponent {
    constructor(http, upcService, Route, router, fb) {
        this.http = http;
        this.upcService = upcService;
        this.Route = Route;
        this.router = router;
        this.fb = fb;
        this.upcInput = '';
        this.selectedFile = null;
        this.isLoading = false;
        this.errorMessage = '';
        this.inputMode = 'image';
        this.scanResult = null;
        this.alert = alert;
        this.close = close;
        this.scanForm = this.fb.group({
            upcInput: ['', [forms_1.Validators.required, forms_1.Validators.pattern(/^\d{12}$/), forms_1.Validators.maxLength(12)]]
        });
    }
    onFileSelected(event) {
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
    processImage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.selectedFile)
                return;
            this.errorMessage = '';
            this.scanResult = null;
            const upc = this.upcService.uploadAndScanImage(this.selectedFile).subscribe({
                next: result => {
                    this.upcInput = result;
                    this.lookupUpc();
                },
                error: e => {
                    this.errorMessage = 'No UPC code detected in image!';
                    this.isLoading = false;
                    console.error(e);
                }
            });
            //
            // try {
            //   const preprocessedImage = await this.preProcessImage(this.selectedFile);
            //   const preProcessedImageFile = new File(
            //     [preprocessedImage],
            //     'preProcessedImage.png',
            //     { type: 'image/png' }
            //   );
            //   try {
            //     const upcCode = await this.scanBarcode(preProcessedImageFile) ?? "";
            //
            //     const upcMatch = upcCode.match(/\d{12}/);
            // if (upcMatch) {
            //
            // } else {
            //   this.errorMessage = 'No UPC code detected in image';
            // }
            // } catch (e) {
            //   this.errorMessage = "No UPC found!";
            //   this.isLoading = false;
            // }
            // } catch (error) {
            //   this.errorMessage = 'Error processing image';
            //   console.error(error);
            // }
        });
    }
    lookupUpc() {
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
                    if (e instanceof UpcNotFoundError_1.UpcNotFoundError) {
                        this.errorMessage = e.message;
                    }
                    else {
                        this.errorMessage = 'Error looking up UPC';
                    }
                    this.isLoading = false;
                    console.error(e);
                }
            });
        }
        else {
            this.errorMessage = "UPC must be a sequence of 12 numbers";
        }
    }
    // need to preprocess for best results
    preProcessImage(file) {
        return __awaiter(this, void 0, void 0, function* () {
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
                            }
                            else {
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
                            }
                            else {
                                reject(new Error('Failed to convert canvas to blob'));
                            }
                            // Clean up to free memory
                            URL.revokeObjectURL(img.src);
                        }, 'image/png');
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                img.onerror = (error) => {
                    reject(error);
                };
                img.src = URL.createObjectURL(file);
            });
        });
    }
    ;
    scanBarcode(imageFile) {
        return new Promise((resolve, reject) => {
            const imageUrl = URL.createObjectURL(imageFile);
            quagga2_1.default.decodeSingle({
                src: imageUrl,
                numOfWorkers: Math.min(navigator.hardwareConcurrency || 4, 2),
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
                URL.revokeObjectURL(imageUrl);
                if ((_a = result === null || result === void 0 ? void 0 : result.codeResult) === null || _a === void 0 ? void 0 : _a.code) {
                    resolve(result.codeResult.code);
                }
                else {
                    reject(new Error('No barcode detected'));
                }
            });
        });
    }
    openCamera() {
        this.cameraInput.nativeElement.click();
    }
};
__decorate([
    (0, core_1.ViewChild)('cameraInput')
], MainPageComponent.prototype, "cameraInput", void 0);
MainPageComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-main-page',
        standalone: true,
        imports: [
            forms_1.FormsModule,
            common_1.NgIf,
            forms_1.ReactiveFormsModule,
            ng_bootstrap_1.NgbAlert
        ],
        templateUrl: './main-page.component.html',
        styleUrl: './main-page.component.css'
    })
], MainPageComponent);
exports.MainPageComponent = MainPageComponent;
