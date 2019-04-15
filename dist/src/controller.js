"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("./enum");
/* tslint:disable:variable-name */
const Controller = (path) => {
    return (target) => {
        Reflect.defineMetadata(enum_1.METADATA.PATH, path || '/', target);
    };
};
exports.default = Controller;
//# sourceMappingURL=controller.js.map