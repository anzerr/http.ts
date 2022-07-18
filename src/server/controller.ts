
import * as querystring from 'querystring';
import is from 'type.util';

const errorWrap = (self, cd) => {
	try {
		return cd();
	} catch(e) {
		if (self._emit) {
			e.cid = self._cid;
			self._emit('error', e);
		}
	}
}

export default class Controller {

	private _res: any;
	private _req: any;
	private _param: any;
	private _cid: string;
	private _emit: (name: string, data: any) => void;

	meta: {method: any; action: any; name: any};
	query: {[key: string]: any};

	get cid(): string {
		return this._cid;
	}

	get response(): any {
		return this._res;
	}

	get request(): any {
		return this._req;
	}

	get param(): any {
		return this._param;
	}

	get headers(): any {
		return errorWrap(this, () => {
			return this._req.headers();
		});
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
			this._cid = options.cid;
			this._emit = options.emit;
			if (this._req && is.function(this._req.query)) {
				this.query = querystring.parse(this._req.query() || '');
			}
		}
	}

	data(): Promise<any> {
		return errorWrap(this, () => {
			if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
				return this._req.data();
			}
			throw new Error('There\'s no data possible on this request');
		});
	}

	pipe(a: any): any {
		return errorWrap(this, () => {
			if (this._req.method().toLowerCase().match(/^(post|delete|put|patch)$/)) {
				return this._req.req().pipe(a);
			}
			throw new Error('There\'s no data possible on this request');
		});
	}

	status(...arg): any {
		return errorWrap(this, () => {
			return this._res.status(...arg);
		});
	}

	json(...arg): any {
		return errorWrap(this, () => {
			return this._res.json(...arg);
		});
	}

	send(...arg): any {
		return errorWrap(this, () => {
			return this._res.send(...arg);
		});
	}

	header(...arg): any {
		return errorWrap(this, () => {
			return this._res.set(...arg);
		});
	}

}
