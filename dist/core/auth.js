"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = exports.initAuth = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rbac_1 = __importDefault(require("./rbac"));
function initAuth(config) {
    return new Auth(config);
}
exports.initAuth = initAuth;
class Auth {
    constructor(config) {
        this.jwtSecret = config.jwtSecret || 'default-secret';
        this.saltRounds = config.saltRounds || 10;
        this.defaultTokenExpiry = config.defaultTokenExpiry || '1h';
        this.rbac = new rbac_1.default(config.rolesConfig || {});
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!password || typeof password !== 'string') {
                throw new Error('Password must be a non-empty string');
            }
            return yield bcrypt_1.default.hash(password, this.saltRounds);
        });
    }
    verifyPassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!password || !hash) {
                return false;
            }
            try {
                return yield bcrypt_1.default.compare(password, hash);
            }
            catch (error) {
                return false;
            }
        });
    }
    generateToken(payload, expiresIn) {
        if (!payload || typeof payload !== 'object') {
            throw new Error('Payload must be an object');
        }
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn: expiresIn || this.defaultTokenExpiry });
    }
    verifyToken(token) {
        if (!token) {
            return null;
        }
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (error) {
            return null;
        }
    }
    isTokenExpired(token) {
        const decoded = this.verifyToken(token);
        if (!decoded)
            return true;
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp < now;
    }
    refreshToken(token, expiresIn) {
        const decoded = this.verifyToken(token);
        if (!decoded)
            return null;
        const { iat, exp } = decoded, payload = __rest(decoded, ["iat", "exp"]);
        return this.generateToken(payload, expiresIn);
    }
}
exports.Auth = Auth;
