export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const buildPagination = ({ page = 1, limit = 20 }) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 20;
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
};
