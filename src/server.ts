
import 'reflect-metadata';
import * as events from 'events';
import * as http from 'http.server';
import {Module} from 'inject.ts';
import is from 'type.util';
import {METADATA, METHOD} from './enum';
import util from './util';
import Controller from './server/controller';

class Server extends events {

	static Controller = Controller;

	private s: any;
	private port: number;
	private map: any;
	private module: Module;
	public alive: boolean;

	constructor(port = 3050) {
		super();
		this.port = port;
		this.map = {};
		for (const i in METHOD) {
			this.map[METHOD[i]] = [];
		}
		this.module = new Module([]);
	}

	instantiate(target: Record<string, any>, options: any[]): any {
		if (!is.array(options)) {
			throw new Error('options needs to be any array');
		}
		return this.module.instantiate(target, options, true);
	}

	find(req: any): any | void {
		const method = req.method().toLowerCase();
		for (const i in this.map[method]) {
			const m = req.url().match(this.map[method][i].reg);
			if (m) {
				return {m: m, map: this.map[method][i]};
			}
		}
		return {m: null, map: null};
	}

	midware(map: any, controller: any): Promise<any | void> {
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

	route(req: any, res: any): any {
		const {m, map} = this.find(req);
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
			}, 5 * 60 * 1000), keys = ['send', 'pipe'];
			for (let i in keys) {
				((k) => {
					const o = res[k].bind(res);
					res[k] = (...arg) => {
						let result = o(...arg);
						this.destroy(controller);
						clearTimeout(clear);
						return result;
					}
				})(keys[i]);
			}

			this.emit('log', ['mapped', `${controller.constructor.name} - ${map.action}`]);
			return this.midware(map, controller).then(() => {
				return controller[map.action]();
			}).then((r) => {
				if (res !== r && r) {
					return (is.object(r) && !Buffer.isBuffer(r)) ? res.json(r) : res.send(r);
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

	start(intercept?: (req: any, res: any) => boolean): Promise<Server> {
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

	close(): Promise<void> {
		this.emit('close');
		this.alive = false;
		return this.s.close();
	}

	withController(list: any[]): Server {
		for (const i in list) {
			const base = Reflect.getMetadata(METADATA.PATH, list[i]);
			if (is.defined(base)) {
				const instance = new list[i]({}),
					methods = util.getAllMethodNames(Object.getPrototypeOf(instance));
				for (const x in methods) {
					const url = Reflect.getMetadata(METADATA.PATH, instance[methods[x]]),
						method = Reflect.getMetadata(METADATA.METHOD, instance[methods[x]]),
						priority = Reflect.getMetadata(METADATA.PRIORITY, instance[methods[x]]),
						midware = Reflect.getMetadata(METADATA.MIDWARE, instance[methods[x]]);

					if (is.defined(url) && is.defined(method)) {
						this.map[method].push({
							instance: instance,
							priority: priority || 5,
							midware: (midware || []).reverse(),
							reg: util.pathToReg(base, url),
							path: util.pathJoin(base, url).replace(/:(\w+)/g, '{$1}'),
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

export default Server;
