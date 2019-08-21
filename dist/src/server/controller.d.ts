export default class Controller {
    private _res;
    private _req;
    private _param;
    readonly response: any;
    readonly request: any;
    readonly param: any;
    readonly query: any;
    readonly headers: any;
    constructor(options?: any);
    data(): Promise<any>;
    pipe(a: any): any;
    status(...arg: any[]): any;
    json(...arg: any[]): any;
    send(...arg: any[]): any;
}
