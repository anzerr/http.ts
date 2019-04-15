"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const enum_1 = require("./enum");
const createRequestMap = (method, path) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(enum_1.METADATA.PATH, path || '', descriptor.value);
        Reflect.defineMetadata(enum_1.METADATA.METHOD, method || enum_1.METHOD.GET, descriptor.value);
        return descriptor;
    };
};
/* tslint:disable:variable-name */
exports.Get = (path) => createRequestMap(enum_1.METHOD.GET, path);
exports.Delete = (path) => createRequestMap(enum_1.METHOD.DELETE, path);
exports.Put = (path) => createRequestMap(enum_1.METHOD.PUT, path);
exports.Patch = (path) => createRequestMap(enum_1.METHOD.PATCH, path);
exports.Options = (path) => createRequestMap(enum_1.METHOD.OPTIONS, path);
exports.All = (path) => createRequestMap(enum_1.METHOD.ALL, path);
//# sourceMappingURL=request.js.map