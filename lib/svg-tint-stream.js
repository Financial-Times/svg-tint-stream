'use strict';

const TransformStream = require('stream').Transform;

/**
 * Class that can be used to tint SVGs with a transform stream.
 * @extends TransformStream
 */
module.exports = class SvgTintStream extends TransformStream {

	/**
	 * Create an SvgTintStream.
	 * @param {Object} options - The transform options to represent.
	 * @param {String} options.color - A hex colour code.
	 */
	constructor(options) {
		super();

		// Allow for the colour to be passed in as a string
		if (typeof options === 'string') {
			options = {
				color: options
			};
		}

		// Default the options
		this.options = options || {
			color: '#000'
		};
		this.options.fill = (typeof this.options.fill === 'undefined' ? true : this.options.fill);
		this.options.stroke = (typeof this.options.stroke === 'undefined' ? true : this.options.stroke);

		// Ensure the colour is a valid hex code
		this.options.color = this.options.color.trim();
		if (this.options.color.indexOf('#') === -1) {
			this.options.color = `#${this.options.color}`;
		}
		if (!/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(this.options.color)) {
			throw new Error('Tint color must be a valid hex code');
		}
	}

	/**
	 * Get the style block that will be added into the SVG.
	 * @return {String}
	 */
	getStyleBlock() {
		let fillStyles = '';
		let strokeStyles = '';
		if (this.options.fill) {
			fillStyles = `fill:${this.options.color}!important;`;
		}
		if (this.options.stroke) {
			strokeStyles = `stroke:${this.options.color}!important;`;
		}
		return `<style>*{${fillStyles}${strokeStyles}}</style>`;
	}

	/**
	 * Perform a transform on a streamed chunk.
	 * @private
	 * @param {Buffer} chunk - The chunk to transform.
	 * @param {String} encoding - The encoding of the chunk.
	 * @param {Function} done - A callback that will be called when the transform is complete.
	 */
	_transform(chunk, encoding, done) {

		// If we've inserted the styles, stop processing chunks,
		// we can save some processing here.
		if (this.stylesInserted) {
			this.push(chunk);
			return done();
		}

		// Split the chunk into characters that we can loop over
		const characters = chunk.toString().split('');
		let output = '';

		for (let character of characters) {
			output += character;

			// This will be called if the styles are inserted mid-way
			// through the chunk. We can safely ignore the rest of the
			// logic and add any remaining characters.
			if (this.stylesInserted) {
				continue;
			}

			// If we're currently inside a tag and we haven't finished
			// working out what the name of the tag is...
			if (this.inTag && !this.hasTagName) {

				// If we encounter a space or a tag close, we've now
				// got the full tag name.
				if (/[\s>]/.test(character)) {
					this.hasTagName = true;

				// Otherwise we're still working it out and we add
				// the character to the in-progress tag name.
				} else {
					this.currentTagName += character;
				}
			}

			// If we encounter a tag opening and we're not already
			// inside a tag, we're entering a tag.
			if (character === '<' && !this.inTag) {
				this.inTag = true;
				this.hasTagName = false;
				this.currentTagName = '';
			}

			// If we're currently inside a tag and we encounter a
			// quote character...
			if ((character === '"' || character === '\'') && this.inTag) {

				// If we're already in an attribute and the new quote
				// character matches the opening quote of this attribute
				// then we've finished processing it.
				if (this.inAttribute) {
					if (character === this.currentAttributeQuote) {
						this.inAttribute = false;
					}

				// Otherwise we're opening a new attribute.
				} else {
					this.currentAttributeQuote = character;
					this.inAttribute = true;
				}
			}

			// If we're currently inside a tag, not inside an attribute,
			// and we encounter a tag close...
			if (character === '>' && this.inTag && !this.inAttribute) {
				this.inTag = false;

				// If the current tag name is SVG, we're now ready to
				// insert our styles directly after the closing ">".
				if (this.currentTagName.toLowerCase() === 'svg') {
					output += this.getStyleBlock();
					this.stylesInserted = true;
				}
			}
		}

		// Push the processed output onto the stream
		this.push(output);
		done();
	}

};
