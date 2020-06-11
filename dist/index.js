"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = exports.Server = void 0;
require("reflect-metadata");
const server_1 = require("./src/server");
exports.Server = server_1.default;
const controller_1 = require("./src/controller");
exports.Controller = controller_1.default;
__exportStar(require("./src/request"), exports);
//# sourceMappingURL=index.js.map