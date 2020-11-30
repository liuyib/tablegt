# TableGT

语言：[English](./README.md) | [中文简体](./README-zh_CN.md)

## 🔮 什么是 TableGT？

![TableGT - what-is-tablegt](./assets/what-is-tablegt.png)

## ✨ 示例

这里有一些文件：

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

在 `demo` 目录下，执行 `node index.js`，此时该目录下会生成一个 `README.md` 文件，文件中的内容如下：

![TableGT - demo](./assets/demo.png)

## 🔨 使用

- 基础用法

  ```js
  const TableGT = require('tablegt');
  const tablegt = new TableGT();

  tablegt.build('./source/');
  ```

- 指定表格头

  ```js
  const TableGT = require('tablegt');
  // signs 和 thead 参数必须同时配置，详见文档说明
  const tablegt = new TableGT({
    signs: ['id', 'title'],
    thead: '| # | Title |\n| :---: | :---: |',
  });

  tablegt.build('./source/');
  ```

- 指定定位标记

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

- 指定输出文件

  ```js
  const TableGT = require('tablegt');
  const tablegt = new TableGT();

  tablegt.build('./source/', './table.md');
  ```

## 📃 文档

- **`new TableGT(opts)`**

  | 参数 | 说明 | 类型 | 必选 | 默认值 |
  | :--- | :--- | :---: | :---: | :---: |
  | `opts.overwrite` | 是否覆盖旧的数据 | boolean | 否 | `true` |
  | `opts.signs` | 需要解析的标记（如果手动指定了该参数，就必须同时手动指定 `thead` 参数） | array | 否 | `['id', 'title', 'level', 'lang', 'tags', 'similars']` |
  | `opts.thead` | 表格头代码（Markdown 语法。该参数仅需在手动指定 `signs` 参数时配置） | string | 否 | `\| # \| Title \| Level \| Lang \| Tags \| Similars \|\n\| :---: \| :--- \| :---: \| :---: \| :---: \| :---: \|` |
  | `opts.marker.start` | 开始定位标记 | string | 否 | `<!-- @tb-start -->` |
  | `opts.marker.end` | 终止定位标记 | string | 否 | `<!-- @tb-end -->` |

- `build(source, target)`

  解析注释中的标记，生成表格数据。

  | 参数 | 说明 | 类型 | 必选 | 默认值 |
  | :--- | :--- | :---: | :---: | :---: |
  | `source` | 需要解析的文件路径 | string | 是 | - |
  | `target` | 存储生成数据的文件的路径 | string | 否 | `./README.md` |

## 👩‍💻 原理

TableGT 会解析文件中以 `/*` 开头的注释块（注意：以 `/**`、`/***`、`...` 开头的注释块会被忽略），并找出其中的 `@XXX` 标记，来生成表格数据。

> TableGT 对 [vscode-leetcode](https://github.com/LeetCode-OpenSource/vscode-leetcode) 生成的注释块做了特殊处理。例如，其生成的注释块如下：
>
> ```js
> /*
>  * @lc app=leetcode.cn id=15 lang=javascript
>  *
>  * [15] 三数之和
>  *
>  * https://leetcode-cn.com/problems/3sum/description/
>  */
> ```
>
> 其中的 `id=15`、`lang=javascript`、`三数之和`、`https://leetcode-cn.com/problems/3sum/description/` 分别被解析为内部的 `id`、`lang`、`title`、`uri` 变量。
>
> 在使用时，`signs` 参数的可选值为：**`['id', 'title', 'level', 'lang', 'tags', 'similars']` 中的任意多项**。其中的 `id`、`lang`、`title` 就是上面解析得到的变量。可以通过配置 `signs` 参数，来指定这些变量是否生成在表格中：
>
> ```js
> const tablegt = new TableGT({
>   signs: ['id', 'title'],
>   thead: '| # | Title |\n| :---: | :---: |',
> });
> ```
>
> 注意：`signs` 和 `thead` 参数必须同时配置，详见文档说明。

## 🤝 开源协议

[MIT](https://github.com/liuyib/tablegt/blob/master/LICENSE)
