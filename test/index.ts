
import 'reflect-metadata';
import {create} from './server';
import util from './util';
import * as assert from 'assert';

const port = 3000 + Math.floor(Math.random() * 3000), count = 600 + Math.floor(Math.random() * 200);

const {server, logs} = create(port);

server.start().then(() => {
	return util.hit(port, count);
}).then((res) => {
	for (const i in logs) {
		assert.equal(logs[i][0], Number(i) + 1);
	}
	assert.equal(logs.length, count * 3);
	assert.equal(server.module.instance.length, 1);
	assert.equal(server.module.instance[0].tClass.count, logs.length);
	assert.equal(server.map.get.length, 1);
	assert.equal(server.map.post.length, 0);
	assert.equal(server.port, port);
	assert.equal(server.alive, true);
	server.close();
	assert.equal(server.alive, false);
	console.log(`http request per sec "${(res.count / res.diff).toFixed(2)}"`);
	process.exit(0);
}).catch((err) => {
	console.log(err);
	process.exit(1);
});
