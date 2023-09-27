export async function getSensorHistory(sensorId, args) {
	let query = [];
	for (let arg of Object.keys(args)) {
		let key = encodeURIComponent(arg);
		let value = encodeURIComponent(args[arg]);
		query.push(`${key}=${value}`);
	}
	const base = 'https://api.purpleair.com/v1';
	const url = `${base}/sensors/${sensorId}/history?${query.join('&')}`;
	const rsp = await fetch(url, {
		method: 'GET',
		headers: {
			"X-API-KEY": process.env.PURPLEAIR_API_KEY
		}
	});
	const data = await rsp.json();
	return data;
}
