
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

export const Get = (path?: string | string[]): any => createRequestMap(METHOD.GET, path);
export const Post = (path?: string | string[]): any => createRequestMap(METHOD.POST, path);
export const Delete = (path?: string | string[]): any => createRequestMap(METHOD.DELETE, path);
export const Put = (path?: string | string[]): any => createRequestMap(METHOD.PUT, path);
export const Options = (path?: string | string[]): any => createRequestMap(METHOD.OPTIONS, path);
export const Patch = (path?: string | string[]): any => createRequestMap(METHOD.PATCH, path);
export const Head = (path?: string | string[]): any => createRequestMap(METHOD.HEAD, path);
export const All = (path?: string | string[]): any => createRequestMap(METHOD.ALL, path);

export const Midware = (func: (...args: any[]) => any, ...arg) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const a = Reflect.getMetadata(METADATA.MIDWARE, descriptor.value) || [];
		a.push({func: func, arg: arg});
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
