
import 'reflect-metadata';
import {Server, Controller, Get, Midware} from '../index';
import {Injectable, Inject} from 'inject.ts';

const logs = [];

@Injectable()
class Log {

	count: number;

	constructor() {
		this.count = 0;
	}

	info(...arg): void {
		this.count += 1;
		logs.push([this.count, ...arg]);
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

@Controller('test')
class Test extends Server.Controller {

	@Inject(Log)
	logger: Log;

	@Get()
	@Midware(mid.func1)
	@Midware(mid.func2, 1, 2, 3)
	@Midware(mid.func3)
	list(): any {
		return `cat_${this.query.name || ''}`;
	}

	@Get('error')
	error(): any {
		return Promise.reject(new Error('shit broke'));
	}

	@Get('timeout')
	timeout(): any {
		setTimeout(() => {
			this.status(200).json(['test']);
		}, 10 * 1000);
	}

}

export const create = (port = 3000): any => {
	const server = new Server(port)
		.withController([Test]);
	server.timeout = 5 * 1000;
	server.on('error', (err) => {
		console.log('http error', err);
	});
	server.on('log', (arg) => {
		console.log('http log', arg);
	});
	return {server: server, logs:logs};
};
