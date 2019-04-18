
import * as path from 'path';
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

	path(...list: string[]): RegExp {
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
