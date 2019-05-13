"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
class Controller {
    get response() {
        return this._res;
    }
    get param() {
        return this._param;
    }
    get query() {
        return querystring.parse(this._req.query() || '');
    }
    constructor(options) {
        if (options) {
            const param = {};
            for (const x in options.param) {
                param[options.param[x]] = options.match[Number(x) + 1];
            }
            this._param = param;
            this._req = options.req;
            this._res = options.res;
        }
    }
    data() {
        if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
            return this._req.data();
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