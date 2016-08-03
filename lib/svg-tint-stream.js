'use strict';

const TransformStream = require('stream').Transform;

module.exports = class SvgTintStream extends TransformStream {

	constructor(options) {
		super();
		if (typeof options === 'string') {
			options = {
				color: options
			};
		}
		this.options = options || {
			color: '#000'
		};
		this.stylesInserted = false;
	}

	getStyleBlock() {
		return `<style>*{fill:${this.options.color}!important;stroke:${this.options.color}!important;}</style>`;
	}

	_transform(chunk, encoding, done) {

		// If we've inserted the styles, stop processing chunks
		if (this.stylesInserted) {
			this.push(chunk);
			return done();
		}

		const characters = chunk.toString().split('');
		let output = '';

		for (let character of characters) {
			output += character;
			if (this.stylesInserted) {
				continue;
			}
			if (this.inTag && !this.hasTagName) {
				if (/[\s>]/.test(character)) {
					this.hasTagName = true;
				} else {
					this.currentTagName += character;
				}
			}
			if (character === '<' && !this.inTag) {
				this.inTag = true;
				this.hasTagName = false;
				this.currentTagName = '';
			}
			if ((character === '"' || character === '\'') && this.inTag) {
				if (this.inAttribute) {
					if (character === this.currentAttributeQuote) {
						this.inAttribute = false;
					}
				} else {
					this.currentAttributeQuote = character;
					this.inAttribute = true;
				}
			}
			if (character === '>' && this.inTag && !this.inAttribute) {
				this.inTag = false;
				if (this.currentTagName.toLowerCase() === 'svg') {
					output += this.getStyleBlock();
					this.stylesInserted = true;
				}
			}
		}

		this.push(output);
		done();
	}

};
