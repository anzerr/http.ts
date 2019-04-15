import 'reflect-metadata';
import Controller from './server/controller';
declare class Server {
    static Controller: typeof Controller;
    private s;
    private port;
    private map;
    private module;
    alive: boolean;
    constructor(port?: number);
    instantiate(target: Object, options: Object): any;
    route(req: any, res: any): any;
    start(): Promise<void>;
    withController(list: any[]): Server;
}
export default Server;
