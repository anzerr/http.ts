
import * as path from 'path';

class Util {

	getAllMethodNames(prototype: any) {
		let out = [];
		do {
			out = out.concat(Object.getOwnPropertyNames(prototype).filter(prop => {
				const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
				if (descriptor.set || descriptor.get) {
					return false;
				}
				return prop !== 'constructor' && typeof prototype[prop] === 'function';
			}));
			/* tslint:disable:no-parameter-reassignment */
		} while ((prototype = Reflect.getPrototypeOf(prototype)) && prototype !== Object.prototype);
		return out;
	}

	path(...list: string[]) {
		let u = path.join(...list.filter((a) => (a)))
			.replace(/\\+/g, '\\/')
			.replace(/:\w+/g, '(\\w+)');
		if (u[u.length - 1] === '/') {
			u = u.substr(0, u.length - 2);
		}
		return new RegExp(`^${(u[0] !== '/') ? '/' : ''}${u}$`);
	}
}

export default (new Util());
