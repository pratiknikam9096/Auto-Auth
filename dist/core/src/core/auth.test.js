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
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const auth = (0, index_1.initAuth)({
    jwtSecret: 'testsecret',
    saltRounds: 10,
    rolesConfig: {
        admin: { can: ['create:post'] },
        user: { can: ['read:post'] }
    }
});
test('hash and verify password', () => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield auth.hashPassword('mypassword');
    expect(yield auth.verifyPassword('mypassword', hash)).toBe(true);
}));
test('generate and verify token', () => {
    const token = auth.generateToken({ id: '1', role: 'admin' }, '1h');
    const payload = auth.verifyToken(token);
    expect(payload === null || payload === void 0 ? void 0 : payload.role).toBe('admin');
});
