
import 'reflect-metadata';
import {METADATA, METHOD} from './enum';

/* tslint:disable:variable-name */
const createRequestMap = (method: string, path?: string | string[]) => {
	return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(METADATA.PATH, path || '', descriptor.value);
		Reflect.defineMetadata(METADATA.METHOD, method || METHOD.GET, descriptor.value);
		return descriptor;
	};
};

export const Get = (path?: string | string[]) => createRequestMap(METHOD.GET, path);
export const Post = (path?: string | string[]) => createRequestMap(METHOD.POST, path);
export const Delete = (path?: string | string[]) => createRequestMap(METHOD.DELETE, path);
export const Put = (path?: string | string[]) => createRequestMap(METHOD.PUT, path);
export const Options = (path?: string | string[]) => createRequestMap(METHOD.OPTIONS, path);
export const Patch = (path?: string | string[]) => createRequestMap(METHOD.PATCH, path);
export const All = (path?: string | string[]) => createRequestMap(METHOD.ALL, path);

export const Midware = (cd: () => any) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const a = Reflect.getMetadata(METADATA.MIDWARE, descriptor.value) || [];
		a.push(cd);
		console.log(cd.toString());
		Reflect.defineMetadata(METADATA.MIDWARE, a, descriptor.value);
		return descriptor;
	};
};

export const Priority = (n: number) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(METADATA.PRIORITY, n || 5, descriptor.value);
		return descriptor;
	};
};
