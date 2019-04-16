
import 'reflect-metadata';
import {Server, Controller, Get} from './index';
import {Injectable, Inject, Module} from 'inject.ts';

@Injectable()
class Log {
	count: number;

	constructor() {
		this.count = 0;
	}

	info(...arg) {
		this.count += 1;
		return console.log(this.count, ...arg);
	}

}

@Controller('user')
class Test extends Server.Controller {
	@Inject(Log)
	logger: Log;

	@Get()
	list() {
		this.logger.info('list');
		return 'cat';
	}

	@Get('error')
	error() {
		throw new Error('cat');
	}

	@Get(':id')
	getUser() {
		this.logger.info('getUser');
		return this.status(200).send('2');
	}

	@Get(':id/friends')
	getFriends() {
		this.logger.info('getFriends');
		this.status(200).send('3');
	}

}

new Server(3000)
	.withController([Test])
	.start();
