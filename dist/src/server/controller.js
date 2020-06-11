"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
const type_util_1 = require("type.util");
class Controller {
    constructor(options) {
        if (options) {
            const param = {};
            for (const x in options.param) {
                param[options.param[x]] = options.match[Number(x) + 1];
            }
            this._param = param;
            this._req = options.req;
            this._res = options.res;
            this._cid = options.cid;
            if (this._req && type_util_1.default.function(this._req.query)) {
                this.query = querystring.parse(this._req.query() || '');
            }
        }
    }
    get cid() {
        return this._cid;
    }
    get response() {
        return this._res;
    }
    get request() {
        return this._req;
    }
    get param() {
        return this._param;
    }
    get headers() {
        return this._req.headers();
    }
    data() {
        if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
            return this._req.data();
        }
        throw new Error('There\'s no data possible on this request');
    }
    pipe(a) {
        if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
            return this._req.req().pipe(a);
        }
        throw new Error('There\'s no data possible on this request');
    }
    status(...arg) {
        return this._res.status(...arg);
    }
    json(...arg) {
        return this._res.json(...arg);
    }
    send(...arg) {
        return this._res.send(...arg);
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map