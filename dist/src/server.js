"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const events_1 = __importDefault(require("events"));
const http = __importStar(require("http.server"));
const inject_ts_1 = require("inject.ts");
const type_util_1 = __importDefault(require("type.util"));
const enum_1 = require("./enum");
const util_1 = __importDefault(require("./util"));
const controller_1 = __importDefault(require("./server/controller"));
class Server extends events_1.default.EventEmitter {
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
        return this.module.instantiate(target, options, true);
    }
    find(req) {
        const method = req.method().toLowerCase();
        for (const i in this.map[method]) {
            const m = req.url().match(this.map[method][i].reg);
            if (m) {
                return { m: m, map: this.map[method][i] };
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
            controller[i] = null;
        }
    }
    route(req, res) {
        const { m, map } = this.find(req);
        if (m) {
            const controller = this.instantiate(map.class, [{
                    match: m,
                    param: map.param,
                    req: req,
                    res: res
                }]);
            controller.meta = {
                method: controller[map.action],
                name: controller.constructor.name,
                action: map.action
            };
            const clear = setTimeout(() => {
                res.status(504).send('request timeout after 5mins');
                this.destroy(controller);
                this.emit('timeout');
            }, 5 * 60 * 1000), keys = ['send', 'pipe'];
            for (const i in keys) {
                ((k) => {
                    const o = res[k].bind(res);
                    res[k] = (...arg) => {
                        const result = o(...arg);
                        this.destroy(controller);
                        clearTimeout(clear);
                        return result;
                    };
                })(keys[i]);
            }
            this.emit('log', ['mapped', `${controller.constructor.name} - ${map.action}`]);
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
                        this.emit('error', e);
                    }
                    return res.status(500).send(e.toString());
                }
            });
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