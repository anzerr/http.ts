
import * as assert from 'assert';
import * as http from 'http';

class Util {

	get(url: string): any {
		return new Promise((resolve) => {
			http.get(url, (res) => {
				const data = [];
				res.on('data', (chunk) => data.push(chunk));
				res.on('end', () => {
					resolve({
						status: res.statusCode,
						headers: res.headers,
						data: Buffer.concat(data).toString()
					});
				});
			});
		});
	}

	hit(port: number, count: number): Promise<any> {
		const wait = [], start = process.hrtime();
		for (let i = 0; i < count; i++) {
			wait.push(this.get(`http://localhost:${port}/test?name=${1}`).then((res) => {
				assert.equal(res.status, 200);
				assert.equal(res.headers['content-length'], res.data.length);
				if (!res.data.match(/^cat_\d+$/) && res.data !== '["test"]') {
					console.log(res.data);
				}
				assert.equal((res.data.match(/^cat_\d+$/) !== null || res.data === '["test"]'), true);
			}));
		}
		return Promise.all(wait).then(() => {
			const diff = process.hrtime(start);
			return {diff: Math.floor((diff[0] * 1e9 + diff[1]) / 1e6) / 1e3, count: count};
		});
	}

}

const util = new Util();
export default util;
