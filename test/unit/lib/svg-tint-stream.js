'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/svg-tint-stream', () => {
	let SvgTintStream;

	beforeEach(() => {
		SvgTintStream = require('../../../lib/svg-tint-stream');
	});

	it('should export a function', () => {
		assert.isFunction(SvgTintStream);
	});

	describe('new SvgTintStream()', () => {
		let svgStream;

		beforeEach(() => {
			svgStream = new SvgTintStream();
		});

		it('has an `options` property set to the expected value', () => {
			assert.isObject(svgStream.options);
			assert.deepEqual(svgStream.options, {
				color: '#000'
			});
		});

		it('has a `getStyleBlock` method', () => {
			assert.isFunction(svgStream.getStyleBlock);
		});

		describe('.getStyleBlock()', () => {
			let styleBlock;

			beforeEach(() => {
				svgStream.options.color = '#abc';
				styleBlock = svgStream.getStyleBlock();
			});

			it('returns an SVG style block as a string', () => {
				assert.strictEqual(styleBlock, '<style>*{fill:#abc!important;stroke:#abc!important;}</style>');
			});

		});

		it('has a `_transform` method', () => {
			assert.isFunction(svgStream._transform);
		});

		describe('._transform(chunk, encoding, callback)', () => {
			let callback;
			let chunks;

			beforeEach(() => {
				chunks = [
					new Buffer('<?xml version="1.0" encoding="UTF-8"?>'),
					new Buffer('<svg>'),
					new Buffer('...')
				];
				callback = sinon.spy();
				svgStream.push = sinon.spy();
				svgStream.getStyleBlock = sinon.stub().returns('{STYLES}');
			});

			it('adds the style block after the opening <svg> tag', () => {
				chunks.forEach(chunk => svgStream._transform(chunk, null, callback));
				assert.calledThrice(svgStream.push);
				assert.callOrder(
					svgStream.push.withArgs(chunks[0].toString()),
					svgStream.push.withArgs(chunks[1].toString() + '{STYLES}'),
					svgStream.push.withArgs(chunks[2])
				);
			});

			describe('when the opening <svg> element is uppercased', () => {

				beforeEach(() => {
					chunks[1] = new Buffer('<SVG>');
					chunks.forEach(chunk => svgStream._transform(chunk, null, callback));
				});

				it('adds the style block after the opening <svg> tag', () => {
					assert.callOrder(
						svgStream.push.withArgs(chunks[0].toString()),
						svgStream.push.withArgs(chunks[1].toString() + '{STYLES}'),
						svgStream.push.withArgs(chunks[2])
					);
				});

			});

			describe('when the opening <svg> element has attributes', () => {

				beforeEach(() => {
					chunks[1] = new Buffer('<svg foo="bar" bar=\'baz\'>');
					chunks.forEach(chunk => svgStream._transform(chunk, null, callback));
				});

				it('adds the style block after the opening <svg> tag', () => {
					assert.callOrder(
						svgStream.push.withArgs(chunks[0].toString()),
						svgStream.push.withArgs(chunks[1].toString() + '{STYLES}'),
						svgStream.push.withArgs(chunks[2])
					);
				});

			});

			describe('when the opening <svg> element has attributes that contain right arrows', () => {

				beforeEach(() => {
					chunks[1] = new Buffer('<svg foo="<bar>" bar=\'<baz>\'>');
					chunks.forEach(chunk => svgStream._transform(chunk, null, callback));
				});

				it('adds the style block after the opening <svg> tag', () => {
					assert.callOrder(
						svgStream.push.withArgs(chunks[0].toString()),
						svgStream.push.withArgs(chunks[1].toString() + '{STYLES}'),
						svgStream.push.withArgs(chunks[2])
					);
				});

			});

			describe('when the opening <svg> element has attributes that contain quotes', () => {

				beforeEach(() => {
					chunks[1] = new Buffer('<svg foo="\'" bar=\'""\'>');
					chunks.forEach(chunk => svgStream._transform(chunk, null, callback));
				});

				it('adds the style block after the opening <svg> tag', () => {
					assert.callOrder(
						svgStream.push.withArgs(chunks[0].toString()),
						svgStream.push.withArgs(chunks[1].toString() + '{STYLES}'),
						svgStream.push.withArgs(chunks[2])
					);
				});

			});

			describe('when the opening <svg> element is broken into multiple chunks', () => {

				beforeEach(() => {
					chunks = [
						new Buffer('<?xml version="1.0" encoding="UTF-8"?>'),
						new Buffer('<svg foo="bar'),
						new Buffer('"></svg>'),
						new Buffer('...')
					];
					chunks.forEach(chunk => svgStream._transform(chunk, null, callback));
				});

				it('adds the style block after the opening <svg> tag', () => {
					assert.callOrder(
						svgStream.push.withArgs(chunks[0].toString()),
						svgStream.push.withArgs(chunks[1].toString()),
						svgStream.push.withArgs('">{STYLES}</svg>'),
						svgStream.push.withArgs(chunks[3])
					);
				});

			});

		});

	});

	describe('new SvgTintStream(options)', () => {
		let svgStream;

		beforeEach(() => {
			svgStream = new SvgTintStream({
				color: '#f00'
			});
		});

		it('has an `options` property set to the expected value', () => {
			assert.isObject(svgStream.options);
			assert.deepEqual(svgStream.options, {
				color: '#f00'
			});
		});

		describe('when `options.color` has no preceeding hash', () => {

			beforeEach(() => {
				svgStream = new SvgTintStream({
					color: 'f00'
				});
			});

			it('the hash is added', () => {
				assert.deepEqual(svgStream.options, {
					color: '#f00'
				});
			});

		});

		describe('when `options.color` is an invalid hex code', () => {

			it('it throws an error', () => {
				assert.throws(() => {
					svgStream = new SvgTintStream({
						color: 'red'
					});
				}, 'Tint color must be a valid hex code');
			});

		});

	});

	describe('new SvgTintStream(color)', () => {
		let svgStream;

		beforeEach(() => {
			svgStream = new SvgTintStream('#0f0');
		});

		it('has an `options` property set to the expected value', () => {
			assert.isObject(svgStream.options);
			assert.deepEqual(svgStream.options, {
				color: '#0f0'
			});
		});

	});

});
