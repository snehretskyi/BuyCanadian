export class UpcNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpcNotFoundError';
  }
}
