# TBuilder

Languages: [English](./README.md) | [中文简体](./README-zh_CN.md)

## 🔮 What is TBuilder?

![TBuilder - what-is-tbuilder](./assets/what-is-tbuilder.png)

## ✨ Example

There are some files:

```
~- source
   ├─ demo1.js
   └─ demo2.js
```

`demo1.js`

```js
/*
 * @lc app=leetcode.cn id=1 lang=javascript
 *
 * [1] 两数之和
 *
 * https://leetcode-cn.com/problems/two-sum/description/
 *
 * @level '⭐'
 * @tags 'Hash Table' 'Double Pointer'
 * @similars 'T#15'
 * @end
 *
 */
```

`demo2.js`

```js
/*
 * @lc app=leetcode.cn id=15 lang=javascript
 *
 * [15] 三数之和
 *
 * https://leetcode-cn.com/problems/3sum/description/
 *
 * @level '⭐⭐'
 * @tags 'Array' 'Hash Table'
 * @similars 'T#1'
 * @end
 *
 */
```

TBuilder can use `@XX` sign to automatically generate table data:

![TBuilder - demo](./assets/demo.png)

## 📃 Documentation

- **`new TBuilder(opts)`**

  |Parameter|Description|Type|Required|Default value|
  |:--|:--|:--:|:--:|:--:|
  |`opts.overwrite`|whether to overwrite old data|boolean|`false`|`true`|
  |`opts.signs`|signs that needs to be parsed|array|`false`|`['id', 'title', 'level', 'lang', 'tags', 'similars']`|
  |`opts.thead`|table header code (Markdown syntax)|string|`false`|`|#|Title|Level|Lang|Tags|Similars|\n|:---:|:---|:---:|:---:|:---:|:---:|`|
  |`opts.marker.start`|start marker|string|`false`|`<!-- @tb-start -->`|
  |`opts.marker.end`|start marker|string|`false`|`<!-- @tb-end -->`|

- `build(sourceFile, outputFile)`

  Parse the signs in the comments to generate tabular data.

  |Parameter|Description|Type|Required|Default value|
  |:--|:--|:--:|:--:|:--:|:--:|
  |`sourceFile`|The path of the file that needs to be parsed|string|`true`|-|
  |`outputFile`|The file path to store the generated data|string|`false`|`./README.md`|

## 🔨 Usage

- Basic usage

  ```js
  const TBuilder = require('TBuilder');
  const tbuilder = new TBuilder();

  tbuilder.build('./source/');
  ```

- Specify table header

  ```js
  const TBuilder = require('TBuilder');
  const tbuilder = new TBuilder({
    signs: ['id', 'title'],
    thead: '|#|Title|\n|:---:|:---:|',
  });

  tbuilder.build('./source/');
  ```

- Specify location marker

  ```js
  const TBuilder = require('TBuilder');
  const tbuilder = new TBuilder({
    marker: {
      start: '// @tb-start',
      end: '// @tb-end',
    },
  });

  tbuilder.build('./source/');
  ```

- Specify output file

  ```js
  const TBuilder = require('TBuilder');
  const tbuilder = new TBuilder();

  tbuilder.build('./source/', './table.md');
  ```

## 🤝 LICENSE

[MIT](https://github.com/liuyib/tbuilder/blob/master/LICENSE)
