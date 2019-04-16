"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    get response() {
        return this._res;
    }
    // add more tools to easyer controller usage
    constructor(options) {
        this._res = options.res;
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