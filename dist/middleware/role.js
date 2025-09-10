"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
/**
 * Role-based authorization middleware
 * @param {RBAC} rbac - Instance of the RBAC class
 * @param {string | string[]} requiredRoles - Required role(s) for access
 * @param {string} [action] - Action to check (optional)
 * @param {string} [resource] - Resource to check (optional)
 * @returns {Function} - Middleware function
 */
function roleMiddleware(rbac, requiredRoles, action, resource) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        const userRole = user.role;
        if (!userRole) {
            return res.status(403).json({ error: 'No role assigned to user.' });
        }
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const hasRequiredRole = rolesArray.includes(userRole);
        if (action && resource) {
            const hasPermission = rbac.can(userRole).perform(action, resource);
            if (!hasPermission) {
                return res.status(403).json({ error: `Insufficient permissions for ${action}:${resource}.` });
            }
        }
        else if (!hasRequiredRole) {
            return res.status(403).json({ error: 'Insufficient role permissions.' });
        }
        next();
    };
}
exports.roleMiddleware = roleMiddleware;
