
import 'reflect-metadata';
import * as events from 'events';
import * as http from 'http.server';
import {Module} from 'inject.ts';
import is from 'type.util';
import {METADATA, METHOD} from './enum';
import {Util} from './util';
import Controller from './server/controller';

export class AsyncIntercept {

	constructor(public _cd: (req: any, res: any, cd: (stop?: boolean) => void) => void) {}

}

export class Server extends events.EventEmitter {

	static Controller = Controller;

	private s: any;
	private port: number;
	private map: any;
	private module: Module;
	public alive: boolean;
	public timeout: number;
	public logs: boolean;

	constructor(port = 3050) {
		super();
		this.port = port;
		this.map = {};
		for (const i in METHOD) {
			this.map[METHOD[i]] = [];
		}
		this.module = new Module([]);
		this.timeout = 5 * 60 * 1000;
		this.logs = true;
	}

	emit(event: string, data?: any): any {
		if (!this.logs && event === 'log') {
			return null;
		}
		return super.emit(event, data);
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
				const matches = [];
				for (let i = 0; i < m.length; i++) {
					matches[i] = decodeURIComponent(m[i]);
				}
				return {m: matches, map: this.map[method][i]};
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
			if (i !== '_emit' && i !== '_cid') {
				controller[i] = null;
			}
		}
	}

	route(req: any, res: any, cid: string, pathFind?: any): any {
		const {m, map} = pathFind || this.find(req);
		if (m) {
			req._path = map.path;
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
				action: map.action,
				path: map.path
			};

			const start = process.hrtime();
			return new Promise((resolve) => {
				let done = false, id = -1;
				const clear = setTimeout(() => {
					if (!done) {
						res.status(504).send('request timeout');
						this.destroy(controller);
						this.emit('timeout', {cid: cid, method: req.method(), url: req.url()});
						resolve((done = true, id = 0));
					} else {
						this.emit('log', ['double_call', {cid: cid, method: req.method(), url: req.url(), type: `0-${id}`}]);
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
							this.emit('log', ['double_call', {cid: cid, method: req.method(), url: req.url(), type: `1-${id}`}]);
						};
					})(keys[i]);
				}

				this.emit('log', ['mapped', `${controller.constructor.name} - ${map.action}`]);
				res.on('end', (info) => {
					this.emit('log', ['delay_total', {
						cid: cid,
						status: res._status,
						header: res._head,
						method: req.method(),
						url: req.url(),
						path: map.path,
						ms: info.ms
					}]);
				});
				return this.midware(map, controller).then(() => {
					if (!is.function(controller[map.action])) {
						throw new Error(`the action "${map.action}" on the controller is not a function it\'s "${typeof controller[map.action]}"`);
					}
					return controller[map.action]();
				}).then((r) => {
					if (res !== r && r) {
						return (is.object(r) && !Buffer.isBuffer(r)) ? res.json(r) : res.send(r);
					}
				}).catch((e) => {
					if (e && e instanceof Error) {
						if (this.listenerCount('error')) {
							(e as any).cid = cid;
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
					status: res._status,
					header: res._head,
					method: req.method(),
					url: req.url(),
					path: map.path,
					ms: ((end[0] * 1e9 + end[1]) / 1e6)
				}]);
			});
		}
	}

	start(intercept?: (req: any, res: any) => boolean | AsyncIntercept): Promise<Server> {
		this.s = new http.Server(this.port);
		this.alive = false;
		return this.s.create(async (req, res) => {
			const cid = Math.random().toString(36).substr(2);
			res._cid = cid;
			this.emit('log', ['request', `${cid} - ${req.method()} - ${req.origin()} - ${req.remote().ip} - ${req.url()}`]);
			let pathFind = null;
			if (intercept && (is.func(intercept) || intercept instanceof AsyncIntercept)) {
				pathFind = this.find(req);
				if (pathFind.m) {
					req._path = pathFind.map.path;
				};
				if (intercept instanceof AsyncIntercept) {
					const stop = await new Promise<boolean>((resolve) => intercept._cd(req, res, resolve));
					if (stop) {
						return;
					}
				} else {
					if (intercept(req, res)) {
						return;
					}
				}
			}
			if (!this.route(req, res, cid, pathFind)) {
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
					methods = Util.getAllMethodNames(Object.getPrototypeOf(instance));
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
							reg: Util.pathToReg(base, url),
							path: Util.pathJoin(base, url).replace(/:(\w+)/g, '{$1}'),
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
