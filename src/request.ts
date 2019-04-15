
import 'reflect-metadata';
import {METADATA, METHOD} from './enum';

const createRequestMap = (method: string, path?: string | string[]) => {
	return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(METADATA.PATH, path || '', descriptor.value);
		Reflect.defineMetadata(METADATA.METHOD, method || METHOD.GET, descriptor.value);
		return descriptor;
	};
};

/* tslint:disable:variable-name */
export const Get = (path?: string | string[]) => createRequestMap(METHOD.GET, path);
export const Delete = (path?: string | string[]) => createRequestMap(METHOD.DELETE, path);
export const Put = (path?: string | string[]) => createRequestMap(METHOD.PUT, path);
export const Patch = (path?: string | string[]) => createRequestMap(METHOD.PATCH, path);
export const Options = (path?: string | string[]) => createRequestMap(METHOD.OPTIONS, path);
export const All = (path?: string | string[]) => createRequestMap(METHOD.ALL, path);
