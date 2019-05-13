
import 'reflect-metadata';
import {Server, Controller, Get, Post, Priority} from './index';
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
		return `cat_${this.query.name || ''}`;
	}

	@Post()
	create() {
		this.logger.info('create');
		return this.data().then((res) => {
			return res;
		});
	}

	@Get('error')
	@Priority(10)
	error() {
		throw new Error('cat');
	}

	@Get(':id')
	getUser() {
		this.logger.info('getUser');
		return {
			id: this.param.id,
			type: 'getUser'
		};
	}

	@Get('overload')
	@Priority(10)
	othererror() {
		this.status(200).send('overloaded');
	}

	@Get(':id/json')
	getFriendsJson() {
		this.logger.info('getFriendsJson');
		this.status(200).json([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	}

	@Get(':id/friends')
	getFriends() {
		this.logger.info('getFriends');
		this.status(200).send('3');
	}

}

new Server(3000)
	.withController([Test])
	.start().then(() => console.log('started'));
