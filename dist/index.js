"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBAC = exports.initAuth = void 0;
// src/index.ts
const auth_1 = require("./core/auth");
Object.defineProperty(exports, "initAuth", { enumerable: true, get: function () { return auth_1.initAuth; } });
const rbac_1 = __importDefault(require("./core/rbac"));
exports.RBAC = rbac_1.default;
