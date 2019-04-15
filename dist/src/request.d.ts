import 'reflect-metadata';
export declare const Get: (path?: string | string[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const Delete: (path?: string | string[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const Put: (path?: string | string[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const Patch: (path?: string | string[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const Options: (path?: string | string[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const All: (path?: string | string[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
