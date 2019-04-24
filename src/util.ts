
import * as is from 'type.util';

class Util {

	getAllMethodNames(prototype: any): any[] {
		let out = [];
		do {
			out = out.concat(Object.getOwnPropertyNames(prototype).filter(prop => {
				const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
				if (descriptor.set || descriptor.get) {
					return false;
				}
				return prop !== 'constructor' && is.function(prototype[prop]);
			}));
			/* tslint:disable:no-parameter-reassignment */
		} while ((prototype = Reflect.getPrototypeOf(prototype)) && prototype !== Object.prototype);
		return out;
	}

	pathToReg(...list: string[]): RegExp {
		const u = this.pathJoin(...list);
		return new RegExp(`^${u.replace(/:\w+/g, '([-_\\.\\w]+)').replace(/[\/\.]/g, '\\$&')}\\/?$`);
	}

	pathJoin(...list: string[]): string {
		let u = list.map((a) => {
			return a.replace(/[^-_\.\w:\/]+/g, '');
		}).join('/');
		if (u[u.length - 1] === '/') {
			u = u.substr(0, u.length - 1);
		}
		if (u[0] !== '/') {
			u = '/' + u;
		}
		return u;
	}
}

export default (new Util());
