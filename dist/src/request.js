"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Priority = exports.Midware = exports.All = exports.Patch = exports.Options = exports.Put = exports.Delete = exports.Post = exports.Get = void 0;
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
const Get = (path) => createRequestMap(enum_1.METHOD.GET, path);
exports.Get = Get;
const Post = (path) => createRequestMap(enum_1.METHOD.POST, path);
exports.Post = Post;
const Delete = (path) => createRequestMap(enum_1.METHOD.DELETE, path);
exports.Delete = Delete;
const Put = (path) => createRequestMap(enum_1.METHOD.PUT, path);
exports.Put = Put;
const Options = (path) => createRequestMap(enum_1.METHOD.OPTIONS, path);
exports.Options = Options;
const Patch = (path) => createRequestMap(enum_1.METHOD.PATCH, path);
exports.Patch = Patch;
const All = (path) => createRequestMap(enum_1.METHOD.ALL, path);
exports.All = All;
const Midware = (func, ...arg) => {
    return (target, propertyKey, descriptor) => {
        const a = Reflect.getMetadata(enum_1.METADATA.MIDWARE, descriptor.value) || [];
        a.push({ func: func, arg: arg });
        Reflect.defineMetadata(enum_1.METADATA.MIDWARE, a, descriptor.value);
        return descriptor;
    };
};
exports.Midware = Midware;
const Priority = (n) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(enum_1.METADATA.PRIORITY, n || 5, descriptor.value);
        return descriptor;
    };
};
exports.Priority = Priority;
//# sourceMappingURL=request.js.map