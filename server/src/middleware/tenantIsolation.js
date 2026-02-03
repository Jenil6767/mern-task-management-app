// Simple middleware that exposes organizationId on the request for services
export const tenantIsolation = (req, res, next) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.organizationId = req.user.organizationId;
  return next();
};


