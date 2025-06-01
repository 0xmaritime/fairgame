"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var globalForPrisma = globalThis;
var prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
exports.default = prisma;
