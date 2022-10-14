
import 'reflect-metadata';
import {Server, Controller, Get, Post, Priority, Midware} from './index';
import {Injectable, Inject} from 'inject.ts';

@Injectable()
class Log {

	count: number;

	constructor() {
		this.count = 0;
	}

	info(...arg): void {
		this.count += 1;
		return console.log(this.count, ...arg);
	}

}

class Mid extends Server.Controller {

	logger: Log;

	func1(): void {
		this.logger.info('func1');
	}

	func2(a, b, c): void {
		this.logger.info('func2', a, b, c);
	}

	func3(): any {
		this.logger.info('func3');
		if (Math.floor(Math.random() * 2) === 1) {
			return this.status(200).json(['test']);
		}
	}

}

const mid = new Mid();

@Controller('user')
class Test extends Server.Controller {

	@Inject(Log)
	logger: Log;

	@Get()
	@Midware(mid.func1)
	@Midware(mid.func2, 1, 2, 3)
	@Midware(mid.func3)
	list(): any {
		this.logger.info('list');
		return `cat_${this.query.name || ''}`;
	}

	@Post()
	create(): any {
		this.logger.info('create');
		return this.data().then((res) => {
			return res;
		});
	}

	@Get('error')
	@Priority(10)
	error(): void {
		throw new Error('cat');
	}

	@Get(':id')
	getUser(): any {
		this.logger.info('getUser');
		return {
			id: this.param.id,
			type: 'getUser'
		};
	}

	@Get('overload')
	@Priority(10)
	othererror(): any {
		this.status(200).send('overloaded');
	}

	@Get(':id/json')
	getFriendsJson(): any {
		this.logger.info('getFriendsJson');
		this.status(200).json([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	}

	@Get(':id/friends')
	getFriends(): any {
		this.logger.info('getFriends');
		this.status(200).send('3');
	}

}

@Controller('other')
class Test1 extends Test {

	@Get(':id/time')
	getTime(): any {
		this.logger.info('getTime');
		setTimeout(() => {
			this.status(200).json(this.meta);
		}, 1000);
	}

}

const server = new Server(3000)
	.withController([Test, Test1]);

server.on('log', (arg) => console.log(...arg));
server.on('error', (err) => {
	console.log('http error', err);
});
server.start().then(() => console.log('started'));
