"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const upc_service_1 = require("./upc.service");
describe('UpcService', () => {
    let service;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
        service = testing_1.TestBed.inject(upc_service_1.UpcService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
