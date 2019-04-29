"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http = require("http.server");
const enum_1 = require("./enum");
const inject_ts_1 = require("inject.ts");
const util_1 = require("./util");
const controller_1 = require("./server/controller");
const is = require("type.util");
class Server {
    constructor(port = 3050) {
        this.port = port;
        this.map = {};
        for (const i in enum_1.METHOD) {
            this.map[enum_1.METHOD[i]] = [];
        }
        this.module = new inject_ts_1.Module([]);
    }
    instantiate(target, options) {
        const m = this.module, a = m.instantiate(target, options), o = [];
        m.instance.forEach((b) => {
            if (a !== b) {
                o.push(b);
            }
        });
        m.instance = o;
        return a;
    }
    route(req, res) {
        const method = req.method().toLowerCase();
        for (const i in this.map[method]) {
            const m = req.url().match(this.map[method][i].reg);
            if (m) {
                const c = this.instantiate(this.map[method][i].class, { match: m, param: this.map[method][i].param, req, res });
                return Promise.resolve().then(() => {
                    return c[this.map[method][i].action]();
                }).then((r) => {
                    if (res !== r && r) {
                        return (is.object(r) && !Buffer.isBuffer(r)) ? res.json(r) : res.send(r);
                    }
                }).catch((e) => {
                    return res.status(500).send(e.toString());
                });
            }
        }
    }
    start(inject) {
        this.s = new http.Server(this.port);
        this.alive = false;
        return this.s.create((req, res) => {
            if (!this.route(req, res)) {
                if (inject) {
                    return inject(req, res);
                }
                return res.status((req.url() === '/') ? 200 : 404).send('');
            }
        }).then(() => {
            for (const i in this.map) {
                for (const x in this.map[i]) {
                    this.instantiate(this.map[i][x].class, {});
                }
            }
            this.alive = true;
            return this;
        });
    }
    close() {
        return this.s.close();
    }
    withController(list) {
        for (const i in list) {
            const base = Reflect.getMetadata(enum_1.METADATA.PATH, list[i]);
            if (is.defined(base)) {
                const instance = new list[i]({}), methods = util_1.default.getAllMethodNames(Object.getPrototypeOf(instance));
                for (const x in methods) {
                    const url = Reflect.getMetadata(enum_1.METADATA.PATH, instance[methods[x]]), method = Reflect.getMetadata(enum_1.METADATA.METHOD, instance[methods[x]]);
                    if (is.defined(url) && is.defined(method)) {
                        this.map[method].push({
                            reg: util_1.default.pathToReg(base, url),
                            path: util_1.default.pathJoin(base, url).replace(/:(\w+)/g, '{$1}'),
                            param: (url.match(/:\w+/) || []).map((a) => a.substr(1)),
                            class: list[i],
                            action: methods[x],
                            instance
                        });
                    }
                }
            }
        }
        return this;
    }
}
Server.Controller = controller_1.default;
exports.default = Server;
//# sourceMappingURL=server.js.map