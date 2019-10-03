export default class Controller {
    private _res;
    private _req;
    private _param;
    query: {
        [key: string]: any;
    };
    readonly response: any;
    readonly request: any;
    readonly param: any;
    readonly headers: any;
    constructor(options?: any);
    data(): Promise<any>;
    pipe(a: any): any;
    status(...arg: any[]): any;
    json(...arg: any[]): any;
    send(...arg: any[]): any;
}
