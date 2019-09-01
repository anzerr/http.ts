"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http = require("http.server");
const inject_ts_1 = require("inject.ts");
const type_util_1 = require("type.util");
const enum_1 = require("./enum");
const util_1 = require("./util");
const controller_1 = require("./server/controller");
const events = require("events");
class Server extends events {
    constructor(port = 3050) {
        super();
        this.port = port;
        this.map = {};
        for (const i in enum_1.METHOD) {
            this.map[enum_1.METHOD[i]] = [];
        }
        this.module = new inject_ts_1.Module([]);
    }
    instantiate(target, options) {
        if (!type_util_1.default.array(options)) {
            throw new Error('options needs to be any array');
        }
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
                const c = this.instantiate(this.map[method][i].class, [{ match: m, param: this.map[method][i].param, req: req, res: res }]);
                this.emit('log', ['mapped', `${c.constructor.name} - ${this.map[method][i].action}`]);
                return Promise.resolve().then(() => {
                    const midware = this.map[method][i].midware;
                    if (midware.length !== 0) {
                        let p = Promise.resolve();
                        for (const v in midware) {
                            ((entry) => {
                                p = p.then(() => entry.func.apply(c, entry.arg)).then((r) => {
                                    if (r instanceof http.Response) {
                                        return Promise.reject();
                                    }
                                });
                            })(midware[v]);
                        }
                        return p;
                    }
                }).then(() => {
                    return c[this.map[method][i].action]();
                }).then((r) => {
                    if (res !== r && r) {
                        return (type_util_1.default.object(r) && !Buffer.isBuffer(r)) ? res.json(r) : res.send(r);
                    }
                }).catch((e) => {
                    if (e && e instanceof Error) {
                        if (this.listenerCount('error')) {
                            this.emit('error', e);
                        }
                        return res.status(500).send(e.toString());
                    }
                });
            }
        }
    }
    start(intercept) {
        this.s = new http.Server(this.port);
        this.alive = false;
        return this.s.create((req, res) => {
            this.emit('log', ['request', `${req.method()} - ${req.origin()} - ${req.remote().ip} - ${req.url()}`]);
            if (intercept && intercept(req, res)) {
                return;
            }
            if (!this.route(req, res)) {
                return res.status((req.url() === '/') ? 200 : 404).send('');
            }
        }).then(() => {
            for (const i in this.map) {
                for (const x in this.map[i]) {
                    this.instantiate(this.map[i][x].class, [{}]);
                }
                this.map[i].sort((a, b) => b.priority - a.priority);
            }
            this.emit('started');
            this.alive = true;
            return this;
        });
    }
    close() {
        this.emit('close');
        this.alive = false;
        return this.s.close();
    }
    withController(list) {
        for (const i in list) {
            const base = Reflect.getMetadata(enum_1.METADATA.PATH, list[i]);
            if (type_util_1.default.defined(base)) {
                const instance = new list[i]({}), methods = util_1.default.getAllMethodNames(Object.getPrototypeOf(instance));
                for (const x in methods) {
                    const url = Reflect.getMetadata(enum_1.METADATA.PATH, instance[methods[x]]), method = Reflect.getMetadata(enum_1.METADATA.METHOD, instance[methods[x]]), priority = Reflect.getMetadata(enum_1.METADATA.PRIORITY, instance[methods[x]]), midware = Reflect.getMetadata(enum_1.METADATA.MIDWARE, instance[methods[x]]);
                    if (type_util_1.default.defined(url) && type_util_1.default.defined(method)) {
                        this.map[method].push({
                            instance: instance,
                            priority: priority || 5,
                            midware: (midware || []).reverse(),
                            reg: util_1.default.pathToReg(base, url),
                            path: util_1.default.pathJoin(base, url).replace(/:(\w+)/g, '{$1}'),
                            param: (url.match(/:\w+/) || []).map((a) => a.substr(1)),
                            class: list[i],
                            action: methods[x]
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