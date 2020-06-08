
# SVG Tint Stream

Set the fill and stroke colours of SVGs with streams.

## Table Of Contents

- [Requirements](#requirements)
- [Usage](#usage)
- [Configuration](#configuration)
- [How it works](#how-it-works)
- [Contributing](#contributing)
- [Migration guide](#migration-guide)
- [Contact](#contact)
- [License](#license)

## Requirements

You'll need [Node.js][node] 12+ installed to run SVG Tint Stream.


## Usage

Install SVG Tint Stream with [npm][npm] or add to your `package.json`:

```
npm install svg-tint-stream
```

Require SVG Tint Stream:

```js
const SvgTintStream = require('svg-tint-stream');
```

`SvgTintStream` extends [Node.js Transform stream][transform], and so can be used anywhere that they can. The constructor accepts a single argument which contains options for the tinting (e.g. the tint colour). The [available options](#configuration) are documented below.

### Tint an SVG on the file system and save it out

```js
// Create the various streams
const readStream = fs.createReadStream('input.svg', 'utf-8');
const writeStream = fs.createWriteStream('output.svg');
const svgStream = new SvgTintStream({
    color: '#f00'
});

// Pipe the original SVG through the transform
// and then into a new file
readStream.pipe(svgStream).pipe(writeStream);
```

### Tint a remote SVG and output the result

This example uses [Request].

```js
// Create the various streams
const requestStream = request('http://example.com/input.svg');
const svgStream = new SvgTintStream({
    color: '#f00'
});

// Pipe the remote SVG through the transform
// and then into stdout
requestStream.pipe(svgStream).pipe(process.stdout);
```

### Tint an SVG on the file system and serve it with Express

This example uses [Express], and tints the SVG based on a URL parameter.

```js
const app = express();

// Handle request to /svg/:color, tinting the SVG
// and piping it into the response
app.get('/svg/:color', (request, response) => {

    // Create the various streams
    const readStream = fs.createReadStream('input.svg', 'utf-8');
    const svgStream = new SvgTintStream({
        color: request.params.color
    });

    // Pipe the original SVG through the transform
    // and then into the response
    response.set('Content-Type', 'image/svg+xml');
    readStream.pipe(svgStream).pipe(response);

});

app.listen(8080);
```


## Configuration

### `color`

_String_. The hex colour code to use when tinting the SVG.

```js
const stream = new SvgTintStream({
	color: '#ff0000'
});
```

If the `options` argument is a string, then it will be used as a colour value. So the following is equivalent:

```js
const stream = new SvgTintStream('#ff0000');
```

### `fill`

_Boolean_. Whether to tint fills in the SVG. Defaults to `true`.

```js
const stream = new SvgTintStream({
	fill: false
});
```

### `stroke`

_Boolean_. Whether to tint strokes in the SVG. Defaults to `true`.

```js
const stream = new SvgTintStream({
	stroke: false
});
```


## How it works

SVG Tint Stream adds a new `<style>` element to the top of your SVG and sets some important style rules. This overrides the fill and stroke colours of all elements.

So if you create an `SvgTintStream` with a color of `#ff0000`, the following styles will be added to the SVG:

```html
<style>
    * {
        fill: #ff0000 !important;
        stroke: #ff0000 !important;
    }
</style>
```


## Contributing

To contribute to SVG Tint Stream, clone this repo locally and commit your code on a separate branch. You'll need to install [Bower] and run `bower install` to load in the SVG fixtures we use for testing.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
npm test                  # run the full test suite
npm run lint              # run the linter
npm run test-unit         # run the unit tests
npm run test-coverage     # run the unit tests with coverage reporting
npm run test-integration  # run the integration tests
```

## Migration guide

State | Major Version | Last Minor Release | Migration guide |
:---: | :---: | :---: | :---:
✨ active | 8 | N/A | [migrate to v1](MIGRATION.md#migrating-from-v0.4.1-to-v1) |
╳ deprecated | 0 | 0.4 | N/A |


## Contact

If you have any questions or comments about `svg-tint-stream`, or need help using it, please either [raise an issue](https://github.com/Financial-Times/svg-tint-stream/issues), visit [#origami-support](https://financialtimes.slack.com/messages/origami-support/) or email [Origami Support](mailto:origami-support@ft.com).

----

## Licence

This software is published by the Financial Times under the [MIT licence][license].

[bower]: https://bower.io/
[express]: https://expressjs.com/
[license]: http://opensource.org/licenses/MIT
[node]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[request]: https://github.com/request/request
[transform]: https://nodejs.org/api/stream.html#stream_class_stream_transform
