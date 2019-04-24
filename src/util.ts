
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
		let u = list.map((a) => {
			return a.replace(/[^\w:\/]+/g, '')
				.replace(/:\w+/g, '(\\w+)');
		}).join('');
		if (u[u.length - 1] === '/') {
			u = u.substr(0, u.length - 2);
		}
		if (u[0] !== '/') {
			u = '/' + u;
		}
		return new RegExp(`^${u.replace(/\//g, '\\/')}\\/?$`);
	}
}

export default (new Util());
