"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const server_1 = __importDefault(require("./src/server"));
exports.Server = server_1.default;
const controller_1 = __importDefault(require("./src/controller"));
exports.Controller = controller_1.default;
__export(require("./src/request"));
//# sourceMappingURL=index.js.map