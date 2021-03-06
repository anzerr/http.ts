"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const events = require("events");
const http = require("http.server");
const inject_ts_1 = require("inject.ts");
const type_util_1 = require("type.util");
const enum_1 = require("./enum");
const util_1 = require("./util");
const controller_1 = require("./server/controller");
class Server extends events.EventEmitter {
    constructor(port = 3050) {
        super();
        this.port = port;
        this.map = {};
        for (const i in enum_1.METHOD) {
            this.map[enum_1.METHOD[i]] = [];
        }
        this.module = new inject_ts_1.Module([]);
        this.timeout = 5 * 60 * 1000;
        this.logs = true;
    }
    emit(event, data) {
        if (!this.logs && event === 'log') {
            return null;
        }
        return super.emit(event, data);
    }
    instantiate(target, options) {
        if (!type_util_1.default.array(options)) {
            throw new Error('options needs to be any array');
        }
        return this.module.instantiate(target, options, true);
    }
    find(req) {
        const method = req.method().toLowerCase();
        for (const i in this.map[method]) {
            const m = req.url().match(this.map[method][i].reg);
            if (m) {
                const matches = [];
                for (let i = 0; i < m.length; i++) {
                    matches[i] = decodeURIComponent(m[i]);
                }
                return { m: matches, map: this.map[method][i] };
            }
        }
        return { m: null, map: null };
    }
    midware(map, controller) {
        const midware = map.midware;
        if (midware.length !== 0) {
            let p = Promise.resolve();
            for (const v in midware) {
                ((entry) => {
                    p = p.then(() => entry.func.apply(controller, entry.arg)).then((r) => {
                        if (r instanceof http.Response) {
                            return Promise.reject();
                        }
                    });
                })(midware[v]);
            }
            return p;
        }
        return Promise.resolve();
    }
    destroy(controller) {
        for (const i in controller) {
            if (i !== '_emit' && i !== '_cid') {
                controller[i] = null;
            }
        }
    }
    route(req, res, cid) {
        const { m, map } = this.find(req);
        if (m) {
            const controller = this.instantiate(map.class, [{
                    match: m,
                    param: map.param,
                    req: req,
                    res: res,
                    cid: cid,
                    emit: (a, b) => this.emit(a, b)
                }]);
            controller.meta = {
                method: controller[map.action],
                name: controller.constructor.name,
                action: map.action
            };
            const start = process.hrtime();
            return new Promise((resolve) => {
                let done = false, id = -1;
                const clear = setTimeout(() => {
                    if (!done) {
                        res.status(504).send('request timeout');
                        this.destroy(controller);
                        this.emit('timeout', { cid: cid, method: req.method(), url: req.url() });
                        resolve((done = true, id = 0));
                    }
                    else {
                        this.emit('log', ['double_call', { cid: cid, method: req.method(), url: req.url(), type: `0-${id}` }]);
                    }
                }, this.timeout);
                const keys = ['send', 'pipe'];
                for (const i in keys) {
                    ((k) => {
                        const o = res[k].bind(res);
                        res[k] = (...arg) => {
                            if (!done) {
                                const result = o(...arg);
                                this.destroy(controller);
                                clearTimeout(clear);
                                resolve((done = true, id = 1));
                                return result;
                            }
                            this.emit('log', ['double_call', { cid: cid, method: req.method(), url: req.url(), type: `1-${id}` }]);
                        };
                    })(keys[i]);
                }
                this.emit('log', ['mapped', `${controller.constructor.name} - ${map.action}`]);
                res.on('end', (info) => {
                    this.emit('log', ['delay_total', {
                            cid: cid,
                            method: req.method(),
                            url: req.url(),
                            ms: info.ms
                        }]);
                });
                return this.midware(map, controller).then(() => {
                    if (!type_util_1.default.function(controller[map.action])) {
                        throw new Error(`the action "${map.action}" on the controller is not a function it\'s "${typeof controller[map.action]}"`);
                    }
                    return controller[map.action]();
                }).then((r) => {
                    if (res !== r && r) {
                        return (type_util_1.default.object(r) && !Buffer.isBuffer(r)) ? res.json(r) : res.send(r);
                    }
                }).catch((e) => {
                    if (e && e instanceof Error) {
                        if (this.listenerCount('error')) {
                            e.cid = cid;
                            this.emit('error', e);
                        }
                        return res.status(500).send(e.toString());
                    }
                }).catch((e) => {
                    if (this.listenerCount('error')) {
                        e.cid = cid;
                        this.emit('error', e);
                    }
                });
            }).then(() => {
                const end = process.hrtime(start);
                this.emit('log', ['delay', {
                        cid: cid,
                        method: req.method(),
                        url: req.url(),
                        ms: ((end[0] * 1e9 + end[1]) / 1e6)
                    }]);
            });
        }
    }
    start(intercept) {
        this.s = new http.Server(this.port);
        this.alive = false;
        return this.s.create((req, res) => {
            const cid = Math.random().toString(36).substr(2);
            res._cid = cid;
            this.emit('log', ['request', `${cid} - ${req.method()} - ${req.origin()} - ${req.remote().ip} - ${req.url()}`]);
            if (intercept && intercept(req, res)) {
                return;
            }
            if (!this.route(req, res, cid)) {
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
                            param: (url.match(/:\w+/g) || []).map((a) => a.substr(1)),
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