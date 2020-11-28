# TableGT

Languages: [English](./README.md) | [中文简体](./README-zh_CN.md)

## 🔮 What is TableGT?

![TableGT - what-is-tablegt](./assets/what-is-tablegt.png)

## ✨ Example

There are some files:

```
demo 
  ├─ source
  |  ├─ demo1.js
  |  └─ demo2.js
  └─ index.js
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

`index.js`

```js
const TableGT = require('tablegt');
const tablegt = new TableGT();

tablegt.build('./source');
```

In the `demo` directory, run `node index.js`, and a `README.md` file will be generated. The contents of the file are as follows:

![TableGT - demo](./assets/demo.png)

## 📃 Documentation

- **`new TableGT(opts)`**

  |Parameter|Description|Type|Required|Default value|
  |:--|:--|:--:|:--:|:--:|
  |`opts.overwrite`|whether to overwrite old data|boolean|`false`|`true`|
  |`opts.signs`|signs that needs to be parsed|array|`false`|`['id', 'title', 'level', 'lang', 'tags', 'similars']`|
  |`opts.thead`|table header code (Markdown syntax)|string|`false`| `\|#\|Title\|Level\|Lang\|Tags\|Similars\|\n\|:---:\|:--\-|:---:\|:---:\|:---:\|:---:\|` |
  |`opts.marker.start`|start marker|string|`false`|`<!-- @tb-start -->`|
  |`opts.marker.end`|start marker|string|`false`|`<!-- @tb-end -->`|

- `build(source, target)`

  Parse the signs in the comments to generate tabular data.

  |Parameter|Description|Type|Required|Default value|
  |:--|:--|:--:|:--:|:--:|
  |`source`|The path of the file that needs to be parsed|string|`true`|-|
  |`target`|The file path to store the generated data|string|`false`|`./README.md`|

## 🔨 Usage

- Basic usage

  ```js
  const TableGT = require('tablegt');
  const tablegt = new TableGT();

  tablegt.build('./source/');
  ```

- Specify table header

  ```js
  const TableGT = require('tablegt');
  const tablegt = new TableGT({
    signs: ['id', 'title'],
    thead: '|#|Title|\n|:---:|:---:|',
  });

  tablegt.build('./source/');
  ```

- Specify location marker

  ```js
  const TableGT = require('tablegt');
  const tablegt = new TableGT({
    marker: {
      start: '// @tb-start',
      end: '// @tb-end',
    },
  });

  tablegt.build('./source/');
  ```

- Specify target file

  ```js
  const TableGT = require('tablegt');
  const tablegt = new TableGT();

  tablegt.build('./source/', './table.md');
  ```

## 🤝 LICENSE

[MIT](https://github.com/liuyib/tablegt/blob/master/LICENSE)
