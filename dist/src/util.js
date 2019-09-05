"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_util_1 = require("type.util");
class Util {
    getAllMethodNames(prototype) {
        let out = [];
        do {
            out = out.concat(Object.getOwnPropertyNames(prototype).filter((prop) => {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
                if (descriptor.set || descriptor.get) {
                    return false;
                }
                return prop !== 'constructor' && type_util_1.default.function(prototype[prop]);
            }));
            /* tslint:disable:no-parameter-reassignment */
        } while ((prototype = Reflect.getPrototypeOf(prototype)) && prototype !== Object.prototype);
        return out;
    }
    pathToReg(...list) {
        const u = this.pathJoin(...list);
        return new RegExp(`^${u.replace(/:\w+/g, '([-_\\.\\w]+)').replace(/[\/\.]/g, '\\$&')}\\/?$`);
    }
    pathJoin(...list) {
        let u = list.map((a) => a.replace(/[^-_\.\w:\/]+/g, ''))
            .filter((a) => a && a !== '/')
            .join('/');
        if (u[u.length - 1] === '/') {
            u = u.substr(0, u.length - 1);
        }
        if (u[0] !== '/') {
            u = '/' + u;
        }
        return u;
    }
}
exports.default = (new Util());
//# sourceMappingURL=util.js.map