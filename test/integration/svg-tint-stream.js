'use strict';

const assert = require('proclaim');
const fs = require('fs');
const SvgTintStream = require('../../lib/svg-tint-stream');

const fixturesDirectory = `${__dirname}/fixture`;
const fixtures = fs.readdirSync(fixturesDirectory);

function flattenStream(stream) {
	return new Promise((resolve, reject) => {
		let data = '';
		stream.on('data', chunk => {
			data += chunk.toString();
		});
		stream.on('end', () => {
			resolve(data);
		});
		stream.on('error', error => {
			reject(error);
		});
	});
}

describe('streaming SVGs', () => {

	fixtures.forEach(fixture => {
		describe(fixture, () => {

			const svgStream = new SvgTintStream({color: '#f00'});
			const readStream = fs.createReadStream(`${fixturesDirectory}/${fixture}`, 'utf-8');
			readStream.pipe(svgStream);

			it('should transform correctly', () => {
				return flattenStream(svgStream).then(svgData => {
					assert.match(svgData, /<svg[^>]+><style>\*{fill:#f00!important;stroke:#f00!important;}<\/style>/i);
				});
			});

		});
	});

});
