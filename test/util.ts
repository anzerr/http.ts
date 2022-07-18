
import * as assert from 'assert';
import * as http from 'http';
import * as url from 'url';

export class Util {

	static get(baseUrl: string): any {
		return Util.request(baseUrl, {method: 'GET'});
	}

	static head(baseUrl: string): any {
		return Util.request(baseUrl, {method: 'HEAD'});
	}

	static request(baseUrl: string, options: any): any {
		const out = url.parse(baseUrl);
		options.host = out.hostname;
		options.port = Number(out.port || 80);
		options.path = out.pathname.replace(/\/{2,}/g, '/');
		if (out.query) {
			options.path += '?' + out.query;
		}
		options.headers = {};
		return new Promise((resolve, reject) => {
			const req = http.request(options, (res) => {
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
			req.end();
		});
	}

	static hit(port: number, count: number): Promise<any> {
		const wait = [], start = process.hrtime();
		let error = 0;
		for (let i = 0; i < count; i++) {
			((n) => {
				wait.push(Util.get(`http://localhost:${port}/test/name/test cât.png?name=${n}`).then((res) => {
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

