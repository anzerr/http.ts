"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const enum_1 = require("./enum");
/* tslint:disable:variable-name */
const createRequestMap = (method, path) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(enum_1.METADATA.PATH, path || '', descriptor.value);
        Reflect.defineMetadata(enum_1.METADATA.METHOD, method || enum_1.METHOD.GET, descriptor.value);
        return descriptor;
    };
};
exports.Get = (path) => createRequestMap(enum_1.METHOD.GET, path);
exports.Post = (path) => createRequestMap(enum_1.METHOD.POST, path);
exports.Delete = (path) => createRequestMap(enum_1.METHOD.DELETE, path);
exports.Put = (path) => createRequestMap(enum_1.METHOD.PUT, path);
exports.Options = (path) => createRequestMap(enum_1.METHOD.OPTIONS, path);
exports.Patch = (path) => createRequestMap(enum_1.METHOD.PATCH, path);
exports.All = (path) => createRequestMap(enum_1.METHOD.ALL, path);
exports.Midware = (func, ...arg) => {
    return (target, propertyKey, descriptor) => {
        const a = Reflect.getMetadata(enum_1.METADATA.MIDWARE, descriptor.value) || [];
        a.push({ func: func, arg: arg });
        Reflect.defineMetadata(enum_1.METADATA.MIDWARE, a, descriptor.value);
        return descriptor;
    };
};
exports.Priority = (n) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(enum_1.METADATA.PRIORITY, n || 5, descriptor.value);
        return descriptor;
    };
};
//# sourceMappingURL=request.js.map