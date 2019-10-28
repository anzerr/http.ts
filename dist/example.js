"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const index_1 = require("./index");
const inject_ts_1 = require("inject.ts");
let Log = class Log {
    constructor() {
        this.count = 0;
    }
    info(...arg) {
        this.count += 1;
        return console.log(this.count, ...arg);
    }
};
Log = __decorate([
    inject_ts_1.Injectable(),
    __metadata("design:paramtypes", [])
], Log);
class Mid extends index_1.Server.Controller {
    func1() {
        this.logger.info('func1');
    }
    func2(a, b, c) {
        this.logger.info('func2', a, b, c);
    }
    func3() {
        this.logger.info('func3');
        if (Math.floor(Math.random() * 2) === 1) {
            return this.status(200).json(['test']);
        }
    }
}
const mid = new Mid();
let Test = class Test extends index_1.Server.Controller {
    list() {
        this.logger.info('list');
        return `cat_${this.query.name || ''}`;
    }
    create() {
        this.logger.info('create');
        return this.data().then((res) => {
            return res;
        });
    }
    error() {
        throw new Error('cat');
    }
    getUser() {
        this.logger.info('getUser');
        return {
            id: this.param.id,
            type: 'getUser'
        };
    }
    othererror() {
        this.status(200).send('overloaded');
    }
    getFriendsJson() {
        this.logger.info('getFriendsJson');
        this.status(200).json([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
    getFriends() {
        this.logger.info('getFriends');
        this.status(200).send('3');
    }
};
__decorate([
    inject_ts_1.Inject(Log),
    __metadata("design:type", Log)
], Test.prototype, "logger", void 0);
__decorate([
    index_1.Get(),
    index_1.Midware(mid.func1),
    index_1.Midware(mid.func2, 1, 2, 3),
    index_1.Midware(mid.func3),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test.prototype, "list", null);
__decorate([
    index_1.Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test.prototype, "create", null);
__decorate([
    index_1.Get('error'),
    index_1.Priority(10),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "error", null);
__decorate([
    index_1.Get(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test.prototype, "getUser", null);
__decorate([
    index_1.Get('overload'),
    index_1.Priority(10),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test.prototype, "othererror", null);
__decorate([
    index_1.Get(':id/json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test.prototype, "getFriendsJson", null);
__decorate([
    index_1.Get(':id/friends'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test.prototype, "getFriends", null);
Test = __decorate([
    index_1.Controller('user')
], Test);
let Test1 = class Test1 extends Test {
    getTime() {
        this.logger.info('getTime');
        setTimeout(() => {
            this.status(200).json(this.meta);
        }, 1000);
    }
};
__decorate([
    inject_ts_1.Inject(Log),
    __metadata("design:type", Log)
], Test1.prototype, "logger", void 0);
__decorate([
    index_1.Get(':id/time'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], Test1.prototype, "getTime", null);
Test1 = __decorate([
    index_1.Controller('other')
], Test1);
const server = new index_1.Server(3000)
    .withController([Test, Test1]);
server.on('log', (arg) => console.log(...arg));
// get throw error from controller
/* server.on('error', (arg) => {
    console.log(arg);
});*/
server.start().then(() => console.log('started'));
//# sourceMappingURL=example.js.map