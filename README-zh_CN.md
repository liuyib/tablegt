# TableGT

语言：[English](./README.md) | [中文简体](./README-zh_CN.md)

## 🤔 什么是 TableGT？

![TableGT - what-is-tablegt](./assets/what-is-tablegt.png)

## 💖 谁在使用？

- [https://github.com/liuyib/leetcode](https://github.com/liuyib/leetcode)

## 🚀 快速体验

将该仓库下载到本地，然后进入 `demo` 目录，执行 `node index.js` 指令，然后就可以在 `demo` 目录下的 `README.md` 中看到生成的表格数据。

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
 * @level ⭐
 * @tags Array, Hash Table
 * @similars T#15
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
 * @level ⭐⭐
 * @tags Array, Double Pointer
 * @similars T#1
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

- 进阶使用

  > 请阅读文档后，再参考**进阶使用**部分。

  - 指定标记和表格头

    ```js
    // signs 和 thead 参数必须同时配置，详见文档说明
    const tablegt = new TableGT({
      signs: ['lc_id', 'lc_title'],
      thead: '| # | Title |\n| :---: | :---: |',
    });
    ```

  - 自定义标记和表格头

    ```js
    const tableget = new TableGT({
      // 会匹配 @foo、@bar、@baz 标记
      signs: ['foo', 'bar', 'baz'],
      thead: '| Foo | Bar | Baz |\n| :---: | :---: | :---: |',
    });
    ```

  - 指定表格生成位置的界定符

    ```js
    const tablegt = new TableGT({
      marker: {
        start: '// @tb-start',
        end: '// @tb-end',
      },
    });
    ```

  - 指定输出文件

    ```js
    tablegt.build('./source/', './table.md');
    ```

## 📃 文档

TableGT 会解析文件中以 `/*` 开头的注释块（注意：以 `/**`、`/***`、`...` 开头的注释块会被忽略），匹配其中的 `@XXX` 标记，并将其后面的字符串拆分成多个关键词，来生成表格。

- **`new TableGT(opts)`**

  | 参数 | 说明 | 类型 | 必选 | 默认值 |
  | :--- | :--- | :---: | :---: | :---: |
  | `opts.overwrite` | 是否覆盖旧的数据 | boolean | 否 | `true` |
  | `opts.signs` | 需要解析的标记（如果手动指定了该参数，就必须同时手动指定 `thead` 参数） | array | 否 | `['lc_id', 'lc_title', 'level', 'lc_lang', 'tags.comma.code', 'similars.comma.code' ]` |
  | `opts.thead` | 表格头代码（Markdown 语法。该参数仅需在手动指定 `signs` 参数时配置） | string | 否 | `\| # \| Title \| Level \| Lang \| Tags \| Similars \|\n\| :---: \| :--- \| :---: \| :---: \| :---: \| :---: \|` |
  | `opts.marker` | 表格生成位置的界定符 | object | 否 | - |
  | `opts.marker.start` | 表格生成的开始位置 | string | 否 | `<!-- @tb-start -->` |
  | `opts.marker.end` | 表格生成的终止位置 | string | 否 | `<!-- @tb-end -->` |

  其中一些参数的补充说明如下：

  - `opts.signs`

    内置的可选值有 `lc_id`、`lc_title`、`lc_lang` 、`level`、`tags`、`similars`。除此之外，你可以自定义需要解析的标记，只要你自定义的标记不与内置的重名即可。

    其中 `lc_` 是特定前缀。以 `lc_` 开头的，只能用于 [vscode-leetcode](https://github.com/LeetCode-OpenSource/vscode-leetcode) 生成的注释块。没有 `lc_` 开头的，会用于匹配 `@XXX` 标记（例如：设置了 `level` 就会去匹配 `@level` 标记）。

    另外，可以给该参数的项添加修饰符，从而指定*如何将标记后面的字符串拆分成多个关键词*，详见**文档 - 修饰符**。

  - `opts.thead`

- `build(source, target)`

  解析注释中的标记，生成表格数据。

  | 参数 | 说明 | 类型 | 必选 | 默认值 |
  | :--- | :--- | :---: | :---: | :---: |
  | `source` | 需要解析的文件路径 | string | 是 | - |
  | `target` | 存储生成数据的文件的路径 | string | 否 | `./README.md` |

- 修饰符

  默认情况下，TableGT 会以 `,` 作为分隔符，将标记后面的字符串拆分成多个关键词。你可以对 `opts.signs` 参数的项添加修饰符，从而将关键词渲染成其他格式。

  可选的修饰符如下：

  - `raw`

    作用：对标记后面的字符串不做任何处理。

    可选：是。

    注意：即使使用 `raw` 修饰符，也不允许在标记后面的字符串中使用 `@` 符号。

    示例：

    ```js
    const tableget = new TableGT({
      signs: ['test.raw'],
      thead: '| Test |\n| :---: |',
    });

    // 要解析的注释如下：
    /*
     * @test my-test1,,,my-test2,,,
     */

    // 则解析后，输出到表格中的原始数据为 my-test1,,,my-test2,,,
    ```

  - `code`

    作用：用反引号（<code>`</code>）包裹拆分出的关键词（这样关键词在 Markdown 中就会以行内代码块的样式显示）。

    可选：是。

    用法：

      1. 只能用于修饰 `opts.signs` 中，没有特定前缀（`xxx_`）的项。
      2. 配合 `comma`、`quote` 修饰符使用时，`code` 修饰符必须放在后面。

  - `comma`

    作用：以半角逗号（`,`）作为分隔符，将标记后面的字符串拆分成多个关键词。

    可选：是。（**如果没有指定修饰符，则 `comma` 作为默认值**）。

    示例：

    ```js
    const tableget = new TableGT({
      signs: ['test.comma.code'],
      thead: '| Test |\n| :---: |',
    });

    // 要解析的注释如下：
    /*
     * @test my-test1, my-test2
     */

    // 则解析后，输出到表格中的原始数据为 `my-test1`, `my-test2`
    // 可以看到，根据半角逗号拆分出了关键词 my-test1 和 my-test2，并用反引号将它们分别包裹
    ```

  - `quote`

    作用：以成对的引号（单双引号均可）作为界定符，将标记后的字符串拆分成多个关键词。

    可选：是。

    示例 1：

    ```js
    const tableget = new TableGT({
      signs: ['test.quote'],
      thead: '| Test |\n| :---: |',
    });

    // 要解析的注释如下：
    /*
     * @test 'my-test1' 'my-test2'
     */

    // 则解析后，输出到表格中的原始数据为 my-test1, my-test2
    // 可以看到，根据引号拆分出了关键词 my-test1 和 my-test2，并用 逗号 + 空格 将它们连接起来
    ```

    示例 2：

    ```js
    const tableget = new TableGT({
      signs: ['test.quote.code'],
      thead: '| Test |\n| :---: |',
    });

    // 要解析的注释如下：
    /*
     * @test 'my-test1' 'my-test2'
     */

    // 则解析后，输出到表格中的原始数据为 `my-test1`, `my-test2`
    // 可以看到，根据引号拆分出了关键词 my-test1 和 my-test2，并用反引号将它们分别包裹
    ```

## 🤝 开源协议

[MIT](https://github.com/liuyib/tablegt/blob/master/LICENSE)
