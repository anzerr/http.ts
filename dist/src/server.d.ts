import 'reflect-metadata';
import Controller from './server/controller';
import * as events from 'events';
declare class Server extends events {
    static Controller: typeof Controller;
    private s;
    private port;
    private map;
    private module;
    alive: boolean;
    constructor(port?: number);
    instantiate(target: Object, options: any[]): any;
    route(req: any, res: any): any;
    start(inject?: any): Promise<Server>;
    close(): Promise<void>;
    withController(list: any[]): Server;
}
export default Server;
