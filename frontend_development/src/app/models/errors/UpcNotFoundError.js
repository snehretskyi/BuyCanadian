"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpcNotFoundError = void 0;
class UpcNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UpcNotFoundError';
    }
}
exports.UpcNotFoundError = UpcNotFoundError;
