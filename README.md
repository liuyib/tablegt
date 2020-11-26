# TBuilder

## Usage

```js
const TBuilder = require('TBuilder');

const tbuilder = new TBuilder({
  signs: ['id', 'title'],
  thead: '|#|Title|\n|:---:|:---:|',
});

tbuilder.build({
  sourcePath: './javascript',
  targetPath: './README.md',
  context: tbuilder,
});
```
