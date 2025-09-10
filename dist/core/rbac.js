"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RBAC {
    constructor(rolesConfig = {}) {
        this.roles = rolesConfig;
    }
    can(role) {
        return {
            perform: (action, resource) => {
                if (!this.roles[role]) {
                    return false;
                }
                const permissions = this.roles[role].can || [];
                const requiredPermission = resource ? `${action}:${resource}` : action;
                return permissions.includes(requiredPermission) ||
                    permissions.includes(`${action}:*`) ||
                    permissions.includes('*');
            }
        };
    }
    getPermissions(role) {
        var _a;
        return ((_a = this.roles[role]) === null || _a === void 0 ? void 0 : _a.can) || [];
    }
    addRole(role, permissions) {
        this.roles[role] = { can: permissions };
    }
    removeRole(role) {
        delete this.roles[role];
    }
}
exports.default = RBAC;
