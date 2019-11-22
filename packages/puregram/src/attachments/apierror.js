class APIError extends Error {
  constructor(message) {
    super(message);

    this.message = message;
    this.name = 'APIError';
    
    Error.captureStackTrace(this);
  }
}

module.exports = APIError;
