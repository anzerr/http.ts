export default class Controller {
    private _res;
    private _req;
    private _param;
    private _cid;
    private _emit;
    meta: {
        method: any;
        action: any;
        name: any;
    };
    query: {
        [key: string]: any;
    };
    get cid(): string;
    get response(): any;
    get request(): any;
    get param(): any;
    get headers(): any;
    constructor(options?: any);
    data(): Promise<any>;
    pipe(a: any): any;
    status(...arg: any[]): any;
    json(...arg: any[]): any;
    send(...arg: any[]): any;
    header(...arg: any[]): any;
}
