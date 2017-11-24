'use strict';

const assert = require('proclaim');
const fs = require('fs');
const path = require('path');
const SvgTintStream = require('../../lib/svg-tint-stream');

const fixtures = getFixtureList([
	path.resolve(__dirname, 'fixture'),
	path.resolve(__dirname, '../../bower_components/o-icons/svg')
]);

describe('streaming SVGs', () => {

	fixtures.forEach(fixture => {
		describe(fixture, () => {

			const svgStream = new SvgTintStream({color: '#f00'});
			const readStream = fs.createReadStream(fixture, 'utf-8');
			readStream.pipe(svgStream);

			it('should transform correctly', () => {
				return flattenStream(svgStream).then(svgData => {
					assert.match(svgData, /<svg[^>]+><style>\*{fill:#f00!important;stroke:#f00!important;}<\/style>/i);
				});
			});

		});
	});

});

function getFixtureList(directories) {
	let fixtures = [];
	directories.forEach(directory => {
		const newFixtures = fs.readdirSync(directory).map(fixture => path.join(directory, fixture));
		fixtures = fixtures.concat(newFixtures);
	});
	return fixtures.filter(isSvg);
}

function isSvg(filePath) {
	return (path.extname(filePath).toLowerCase() === '.svg');
}

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
