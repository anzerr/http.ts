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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "list", null);
__decorate([
    index_1.Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "create", null);
__decorate([
    index_1.Get('error'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "error", null);
__decorate([
    index_1.Get(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "getUser", null);
__decorate([
    index_1.Get(':id/json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "getFriendsJson", null);
__decorate([
    index_1.Get(':id/friends'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "getFriends", null);
Test = __decorate([
    index_1.Controller('user')
], Test);
new index_1.Server(3000)
    .withController([Test])
    .start();
//# sourceMappingURL=example.js.map