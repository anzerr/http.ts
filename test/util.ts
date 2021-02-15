
import * as assert from 'assert';
import * as http from 'http';

class Util {

	get(url: string): any {
		return new Promise((resolve, reject) => {
			http.get(url, (res) => {
				const data = [];
				res.on('data', (chunk) => data.push(chunk));
				res.on('error', (err) => {
					reject(err);
				});
				res.on('end', () => {
					resolve({
						status: res.statusCode,
						headers: res.headers,
						data: Buffer.concat(data)
					});
				});
			}).on('error', (err) => {
				reject(err);
			});
		});
	}

	hit(port: number, count: number): Promise<any> {
		const wait = [], start = process.hrtime();
		let error = 0;
		for (let i = 0; i < count; i++) {
			((n) => {
				wait.push(this.get(`http://localhost:${port}/test/name/test cât.png?name=${n}`).then((res) => {
					try {
						assert.equal(res.status, 200);
						assert.equal(res.headers['content-length'], res.data.length);
						const data = res.data.toString();
						if (!data.match(`[{"name":"test cât.png"},{"name":"${n}"}]`) && data !== '["test"]') {
							console.log(data);
						}
						assert.equal((data.match(`[{"name":"test cât.png"},{"name":"${n}"}]`) !== null || data === '["test"]'), true);
					} catch(err) {
						console.log('failed request', err);
						error += 1;
					}
				}).catch((err) => {
					console.log('failed request', err);
					error += 1;
				}));
			})(i);
		}
		return Promise.all(wait).then(() => {
			const diff = process.hrtime(start);
			return {diff: Math.floor((diff[0] * 1e9 + diff[1]) / 1e6) / 1e3, count: count, error: error};
		});
	}

}

const util = new Util();
export default util;
