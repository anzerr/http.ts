
import is from 'type.util';

export class Util {

	static getAllMethodNames(prototype: any): any[] {
		let out = [];
		do {
			out = out.concat(Object.getOwnPropertyNames(prototype).filter((prop) => {
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

	static pathToReg(...list: string[]): RegExp {
		const u = Util.pathJoin(...list);
		return new RegExp(`^${u.replace(/:\w+/g, '([-_%\\.\\wÀ-ÖØ-öø-ÿ]+)').replace(/[\/\.]/g, '\\$&')}\\/?$`);
	}

	static pathJoin(...list: string[]): string {
		let u = list.map((a) => a.replace(/[^-_\.\w:\/]+/g, ''))
			.filter((a) => a && a !== '/')
			.join('/');
		if (u[u.length - 1] === '/') {
			u = u.substr(0, u.length - 1);
		}
		if (u[0] !== '/') {
			u = '/' + u;
		}
		return u;
	}

}
