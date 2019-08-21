
import * as querystring from 'querystring';

export default class Controller {

	private _res: any;
	private _req: any;
	private _param: any;

	get response(): any {
		return this._res;
	}

	get request(): any {
		return this._req;
	}

	get param(): any {
		return this._param;
	}

	get query(): any {
		return querystring.parse(this._req.query() || '');
	}

	get headers(): any {
		return this._req.headers();
	}

	constructor(options?: any) {
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

	data(): Promise<any> {
		if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
			return this._req.data();
		}
		throw new Error('There\'s no data possible on this request');
	}

	pipe(a: any): any {
		if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
			return this._req.req().pipe(a);
		}
		throw new Error('There\'s no data possible on this request');
	}

	status(...arg): any {
		return this._res.status(...arg);
	}

	json(...arg): any {
		return this._res.json(...arg);
	}

	send(...arg): any {
		return this._res.send(...arg);
	}

}
