/// <reference types="node" />
import 'reflect-metadata';
import * as events from 'events';
import Controller from './server/controller';
declare class Server extends events.EventEmitter {
    static Controller: typeof Controller;
    private s;
    private port;
    private map;
    private module;
    alive: boolean;
    timeout: number;
    logs: boolean;
    constructor(port?: number);
    emit(event: string, data?: any): any;
    instantiate(target: Record<string, any>, options: any[]): any;
    find(req: any): any | void;
    midware(map: any, controller: any): Promise<any | void>;
    destroy(controller: any): void;
    route(req: any, res: any, cid: string): any;
    start(intercept?: (req: any, res: any) => boolean): Promise<Server>;
    close(): Promise<void>;
    withController(list: any[]): Server;
}
export default Server;
