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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_js_1 = require("../lib/prisma.js");
var blob_1 = require("@vercel/blob");
var fs = require("fs/promises");
var path = require("path");
function migrateToBlob() {
    return __awaiter(this, void 0, void 0, function () {
        var reviews, _i, reviews_1, review, localPath, fileBuffer, pathname, blob, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, 12, 14]);
                    return [4 /*yield*/, prisma_js_1.default.review.findMany({
                            where: {
                                featuredImage: {
                                    not: '',
                                },
                            },
                        })];
                case 1:
                    reviews = _a.sent();
                    console.log("Found ".concat(reviews.length, " reviews to migrate"));
                    _i = 0, reviews_1 = reviews;
                    _a.label = 2;
                case 2:
                    if (!(_i < reviews_1.length)) return [3 /*break*/, 10];
                    review = reviews_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 8, , 9]);
                    // Skip if the image is already a blob URL
                    if (review.featuredImage.startsWith('https://')) {
                        console.log("Skipping review ".concat(review.id, " - already using blob storage"));
                        return [3 /*break*/, 9];
                    }
                    localPath = path.join(process.cwd(), 'public', review.featuredImage);
                    return [4 /*yield*/, fs.readFile(localPath)];
                case 4:
                    fileBuffer = _a.sent();
                    pathname = "reviews/".concat(Date.now(), "-").concat(path.basename(review.featuredImage));
                    return [4 /*yield*/, (0, blob_1.put)(pathname, fileBuffer, {
                            access: 'public',
                        })];
                case 5:
                    blob = _a.sent();
                    // Update the review with the new blob URL
                    return [4 /*yield*/, prisma_js_1.default.review.update({
                            where: { id: review.id },
                            data: {
                                featuredImage: blob.url,
                                featuredImagePathname: blob.pathname,
                            },
                        })];
                case 6:
                    // Update the review with the new blob URL
                    _a.sent();
                    console.log("Migrated review ".concat(review.id, " - ").concat(blob.url));
                    // Delete the local file
                    return [4 /*yield*/, fs.unlink(localPath)];
                case 7:
                    // Delete the local file
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error("Error migrating review ".concat(review.id, ":"), error_1);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10:
                    console.log('Migration completed');
                    return [3 /*break*/, 14];
                case 11:
                    error_2 = _a.sent();
                    console.error('Migration failed:', error_2);
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, prisma_js_1.default.$disconnect()];
                case 13:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
migrateToBlob();
