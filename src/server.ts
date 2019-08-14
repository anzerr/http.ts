
import 'reflect-metadata';
import * as http from 'http.server';
import { METADATA, METHOD } from './enum';
import {Module} from 'inject.ts';
import util from './util';
import Controller from './server/controller';
import * as is from 'type.util';
import * as events from 'events';

class Server extends events {

	static Controller = Controller;

	private s: any;
	private port: number;
	private map: any;
	private module: Module;
	public alive: boolean;

	constructor(port: number = 3050) {
		super();
		this.port = port;
		this.map = {};
		for (const i in METHOD) {
			this.map[METHOD[i]] = [];
		}
		this.module = new Module([]);
	}

	instantiate(target: Object, options: any[]): any {
		if (!is.array(options)) {
			throw new Error('options needs to be any array');
		}
		const m: any = this.module, a = m.instantiate(target, options), o = [];
		m.instance.forEach((b) => {
			if (a !== b) {
				o.push(b);
			}
		});
		m.instance = o;
		return a;
	}

	route(req: any, res: any): any {
		const method = req.method().toLowerCase();
		for (const i in this.map[method]) {
			const m = req.url().match(this.map[method][i].reg);
			if (m) {
				const c = this.instantiate(this.map[method][i].class, [{match: m, param: this.map[method][i].param, req, res}]);
				this.emit('log', ['mapped', `${c.constructor.name} - ${this.map[method][i].action}`]);
				return Promise.resolve().then(() => {
					const midware = this.map[method][i].midware;
					if (midware.length !== 0) {
						let p = Promise.resolve();
						for (const i in midware) {
							((entry) => {
								p = p.then(() => entry.func.apply(c, entry.arg)).then((res) => {
									if (res instanceof http.Response) {
										return Promise.reject();
									}
								});
							})(midware[i]);
						}
						return p;
					}
				}).then((res) => {
					return c[this.map[method][i].action]();
				}).then((r) => {
					if (res !== r && r) {
						return (is.object(r) && !Buffer.isBuffer(r)) ? res.json(r) : res.send(r);
					}
				}).catch((e) => {
					if (e && e instanceof Error) {
						return res.status(500).send(e.toString());
					}
				});
			}
		}
	}

	start(inject?: any): Promise<Server> {
		this.s = new http.Server(this.port);
		this.alive = false;
		return this.s.create((req, res) => {
			this.emit('log', ['request', `${req.method()} - ${req.origin()} - ${req.remote().ip} - ${req.url()}`]);
			if (!this.route(req, res)) {
				if (inject) {
					return inject(req, res);
				}
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
							instance,
							priority: priority || 5,
							midware: (midware || []).reverse(),
							reg: util.pathToReg(base, url),
							path: util.pathJoin(base, url).replace(/:(\w+)/g, '{$1}'),
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

export default Server;
