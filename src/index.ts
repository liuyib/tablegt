/* eslint-disable @typescript-eslint/no-var-requires */
const fse = require('fs-extra');
const comments = require('comment-parser');

interface IStoreParse {
  id?: string | number;
  title?: string;
  uri?: string;
  lang?: string;
  level?: string;
  tags?: any;
  similars?: any;
  [prop: string]: any;
}

/**
 * Parse the specified file and generate table data.
 * @param sourcePath The path to the file that needs to be parsed.
 * @param targetPath The file path to store the generated data.
 * @param context
 */
const parseComment = function parseComment(
  sourcePath: string,
  targetPath: string,
  context: any,
): void {
  const opts = context.opts;
  const store: IStoreParse = {};

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
            `TBuilder WARN: can't find valid MARKER in "${sourcePath}"`,
          );
          return;
        }

        // If file not exist, create it. if exist, ignore.
        fse.ensureFileSync(targetPath);

        const fileBuffer = fse.readFileSync(targetPath);
        const fileContent = Buffer.from(fileBuffer).toString();

        const startPos = fileContent.indexOf(opts.marker.start);
        const endPos = fileContent.indexOf(opts.marker.end);

        const beforeTable = fileContent.slice(0, startPos);
        const afterTable = fileContent.slice(endPos + opts.marker.end.length);
        const oldTable = fileContent
          .slice(startPos + opts.marker.start.length, endPos)
          .trim();
        const sign: IStoreParse = {
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

        // According to the enabled SIGN, generate data sequentially.
        let newTable = '|';
        opts.signs.forEach((key: string) => {
          newTable += `${sign[key]}|`;
        });

        if (opts.overwrite) {
          context.cache = `${context.cache}${newTable}\n`;
        }

        let insertContent = '';
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
};

/**
 * Read file path recursively.
 * @param path The path that needs to be read.
 * @param trace Store the read path.
 * @returns A one-dimensional array of all file paths.
 */
const readPath = function readPath(path: string, trace: string): any {
  // Is file, return its relative path.
  if (!fse.lstatSync(path).isDirectory()) {
    return [trace];
  }

  const dirs: any = fse.readdirSync(path);
  const paths: any = [];

  dirs.forEach((dir: string) => {
    const nextPath = `${path}/${dir}`;
    const nextTrace = `${trace}/${dir}`;
    const isDir = fse.lstatSync(nextPath).isDirectory();

    if (isDir) {
      // If dir, search files recursively.
      const filePath = readPath(nextPath, nextTrace);
      paths.push(...filePath);
    } else {
      // Is file, return its relative path.
      paths.push(nextTrace);
    }
  });

  return paths;
};

/**
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
class TBuilder {
  // Configuration item.
  public opts: any;
  // The cache data, only be used when `opts.overwrite` is true.
  // Keep the previous table data and pass it to the next generation.
  public cache: string;

  constructor(options: unknown) {
    /**
     * Default configuration.
     * @param {boolean} overwrite     Whether to overwrite old data.
     * @param {Array}   signs         Parsable sign.
     * @param {string}  thead         Table header (Markdown syntax).
     * @param {Object}  marker        Marking point, where data is generated.
     * @param {string}  marker.start
     * @param {string}  marker.end
     */
    const DEFAULT_OPTION = {
      overwrite: true,
      signs: ['id', 'title', 'level', 'lang', 'tags', 'similars'],
      thead: `|#|Title|Level|Lang|Tags|Similars|\n|:---:|:---|:---:|:---:|:---:|:---:|`,
      marker: {
        start: '<!-- @tb-start -->',
        end: '<!-- @tb-end -->',
      },
    };

    this.opts = Object.assign({}, DEFAULT_OPTION, options);
    this.cache = '';
  }

  /**
   * Generate table data from some comments.
   * @param sourcePath The path to the file that needs to be parsed.
   * @param targetPath The file path to store the generated data.
   */
  build(sourcePath: string, targetPath = './README.md'): void {
    if (!sourcePath) {
      console.error(`TBuilder ERR!: please pass in parameters.`);
      return;
    }
    if (!fse.existsSync(sourcePath)) {
      console.error(`TBuilder ERR!: path "${sourcePath}" is not exist.`);
      return;
    }

    const paths = readPath(sourcePath, sourcePath);

    if (!paths || !paths.length) {
      console.error(`TBuilder ERR!: directory "${sourcePath}" is empty.`);
      return;
    }

    if (Array.isArray(paths)) {
      paths.forEach((path: string) => {
        parseComment(path, targetPath, this);
      });
    }
  }
}

module.exports = TBuilder;
