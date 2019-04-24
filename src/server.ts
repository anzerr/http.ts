
import 'reflect-metadata';
import * as http from 'http.server';
import { METADATA, METHOD } from './enum';
import {Module} from 'inject.ts';
import util from './util';
import Controller from './server/controller';
import * as is from 'type.util';

class Server {

	static Controller = Controller;

	private s: any;
	private port: number;
	private map: any;
	private module: Module;
	public alive: boolean;

	constructor(port: number = 3050) {
		this.port = port;
		this.map = {};
		for (const i in METHOD) {
			this.map[METHOD[i]] = [];
		}
		this.module = new Module([]);
	}

	instantiate(target: Object, options: Object): any {
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
				const c = this.instantiate(this.map[method][i].class, {match: m, param: this.map[method][i].param, req, res});
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

	start(inject?: any): Promise<Server> {
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
			this.alive = true;
			return this;
		});
	}

	close(): Promise<void> {
		return this.s.close();
	}

	withController(list: any[]): Server {
		for (const i in list) {
			const base = Reflect.getMetadata(METADATA.PATH, list[i]);
			if (base) {
				const instance = new list[i]({}),
					methods = util.getAllMethodNames(Object.getPrototypeOf(instance));
				for (const x in methods) {
					const url = Reflect.getMetadata(METADATA.PATH, instance[methods[x]]),
						method = Reflect.getMetadata(METADATA.METHOD, instance[methods[x]]);

					if (is.defined(url) && is.defined(method)) {
						this.map[method].push({
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
		console.log(this.map);
		return this;
	}

}

export default Server;
