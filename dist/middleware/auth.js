"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
/**
 * Express middleware for JWT authentication
 * @param {Auth} auth - Instance of the Auth class
 * @returns {Function} - Express middleware function
 */
const authMiddleware = (auth) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;
        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }
        const decoded = auth.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                error: 'Invalid or expired token.'
            });
        }
        req.user = decoded;
        next();
    };
};
exports.authMiddleware = authMiddleware;
