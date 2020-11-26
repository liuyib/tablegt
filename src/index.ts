import fse from 'fs-extra';
import comments from 'comment-parser';

const parseComment = function parseComment({
  sourcePath,
  targetPath,
  context,
}: {
  sourcePath: string;
  targetPath: string;
  context: any;
}): any {
  const opts = context.opts;
  const store: any = {};

  // @ts-ignore
  comments.file(
    sourcePath,
    {
      parsers: [
        function parseTag(str: string) {
          if (/^@lc[\s\S]*/.test(str)) {
            const lines = str.split(/\n/).filter((v) => v);
            const first = lines[0].split(/\s/).filter((v) => v);
            const second = lines[1].split(/\s/).filter((v) => v);

            const id = first[2].replace('id=', '');
            const lang = first[3].replace('lang=', '');
            const title = second.slice(1).join(' ');
            const uri = lines[2];

            Object.assign(store, { id, title, uri, lang });
          }

          // TODO: 不能写死
          ['level', 'tags', 'similars'].forEach((type: string) => {
            if (new RegExp(`^@${type}[\\s\\S]*`).test(str)) {
              const keys = str
                .split(/['"]([^'"]+)['"]/gi)
                .filter((key) => !/^\s+$/.test(key) && key !== '')
                .slice(1);

              Object.assign(store, { [type]: keys });
            }
          });

          return { source: ' @', data: { tag: store } };
        },
      ],
    },
    (error: any, data: any, finish: any) => {
      if (error && error.message) {
        console.error(`TBuilder ERR!: ${error.message}`);
      }

      if (data) {
        if (!Object.keys(store).length) {
          console.warn(
            `TBuilder WARN: can't find valid tag in "${sourcePath}"`,
          );
          return;
        }

        // If file not exist, create it. If exist, ignore.
        fse.ensureFileSync(targetPath);

        const fileBuffer = fse.readFileSync(targetPath);
        const fileContent = Buffer.from(fileBuffer).toString();

        const startPos = fileContent.indexOf(opts.marker.start);
        const endPos = fileContent.indexOf(opts.marker.end);

        let insertContent = '';
        const beforeTable = fileContent.slice(0, startPos);
        const afterTable = fileContent.slice(endPos + opts.marker.end.length);
        const oldTable = fileContent
          .slice(startPos + opts.marker.start.length, endPos)
          .trim();
        const sign: any = {
          id: store.id || '',
          title: `[${store.title}](${store.uri})`,
          level: store.level || '',
          lang: `[${store.lang}](${sourcePath})`,
          tags: '',
          similars: '',
        };

        if (Array.isArray(store.tags) && store.tags.length) {
          store.tags.forEach((tag: string) => {
            sign.tags += `\`${tag}\`, `;
          });
          sign.tags = sign.tags.trim().slice(0, -1);
        }
        if (Array.isArray(store.similars) && store.similars.length) {
          store.similars.forEach((similar: string) => {
            sign.similars += `\`${similar}\`, `;
          });
          sign.similars = sign.similars.trim().slice(0, -1);
        }

        let newTable = '|';
        opts.signs.forEach((key: string) => {
          newTable += `${sign[key]}|`;
        });

        if (opts.overwrite) {
          context.cache = `${context.cache}${newTable}\n`;
        }

        insertContent += `${opts.marker.start}\n`;
        insertContent += `${opts.overwrite ? opts.thead : oldTable}\n`;
        insertContent += `${opts.overwrite ? context.cache : newTable}`;
        insertContent += `\n${opts.marker.end}`;

        const newFileContent = beforeTable + insertContent + afterTable;

        console.info(`TBuilder INFO: start parse "${sourcePath}" file`);
        fse.writeFileSync(targetPath, newFileContent, { encoding: 'utf8' });
        console.info('TBuilder DONE: table generate successfully!');
      }

      if (finish) {
        console.info(finish);
      }
    },
  );

  return store;
};

const readPath = function readPath(path: string, trace: string): any {
  if (!fse.existsSync(path)) return;
  // find file, return its relative path.
  if (!fse.lstatSync(path).isDirectory()) {
    return [trace];
  }

  const dirContent: any = fse.readdirSync(path);
  const paths: any = [];

  dirContent.forEach((dir: string) => {
    const nextPath = `${path}/${dir}`;
    const nextTrace = `${trace}/${dir}`;
    const isDir = fse.lstatSync(nextPath).isDirectory();

    if (isDir) {
      const filePath = readPath(nextPath, nextTrace);
      paths.push(...filePath);
    } else {
      // is file, return its relative path.
      paths.push(nextTrace);
    }
  });

  return paths;
};

/**
 * @author liuyib <https://github.com/liuyib/>
 * @example
 *   const tbuilder = new TBuilder({
 *     signs: ['id', 'title'],
 *     thead: '|#|题目|\n|:---:|:---:|',
 *   });
 *
 *   tbuilder.build({
 *     sourcePath: './javascript',
 *     targetPath: './README.md',
 *     context: tbuilder,
 *   });
 */
export default class TBuilder {
  public opts: any;
  public cache: string;

  constructor(options: unknown) {
    const DEFAULT_OPTION = {
      // 是否覆盖之前的数据（true：每次都遍历所有文件，重新生成数据。false：将新数据追加到旧数据后面）
      overwrite: true,
      // 需要解析的标签（数量和顺序要和下面的 thead 保持一致）
      signs: ['id', 'title', 'level', 'lang', 'tags', 'similars'],
      // 表格头（Markdown 语法）
      thead: `|#|题目|难度|解答|标签|相似|\n|:---:|:---|:---:|:---:|:---:|:---:|`,
      // 生成数据的标记点
      marker: {
        start: '<!-- @tb-start -->',
        end: '<!-- @tb-end -->',
      },
    };

    this.opts = Object.assign({}, DEFAULT_OPTION, options);
    // only used when `opts.overwrite == true`
    // keep last table data, and pass to next generation.
    this.cache = '';
  }

  build({
    sourcePath,
    targetPath,
    context,
  }: {
    sourcePath: string;
    targetPath: string;
    context: any;
  }): void {
    if (!sourcePath || !targetPath) {
      console.error('TBuilder ERR!: please pass parameters.');
      return;
    }

    const paths = readPath(sourcePath, sourcePath);

    if (!paths || !paths.length) {
      console.error('TBuilder ERR!: directory is empty.');
    }

    if (Array.isArray(paths) && paths.length) {
      paths.forEach((sourcePath: string) => {
        parseComment({ sourcePath, targetPath, context });
      });
    }
  }
}
