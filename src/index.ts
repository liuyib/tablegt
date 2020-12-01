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

const parseSignWithModifier = function parseSignWithModifier(
  str: string,
  modifiers: string[],
): any {
  interface IModifier {
    raw: (str: string) => string[];
    quote: (str: string) => string[];
    comma: (str: string) => string[];
    code: (str: string) => string[];
    [prop: string]: (str: string) => string[];
  }

  // Keep the origin string.
  const MODIFIER_RAW = 'raw';
  // Get the characters between quotes.
  const MODIFIER_QUOTE = 'quote';
  // Split the string with comma.
  const MODIFIER_COMMA = 'comma';
  // Use ` to wrap the processed characters.
  const MODIFIER_CODE = 'code';
  // Default modifier.
  const MODIFIER_DEFAULT = MODIFIER_COMMA;

  const MODIFIER: IModifier = {
    [MODIFIER_RAW]: (str: string) => [str],
    [MODIFIER_QUOTE]: (str: string) => {
      return str
        .split(/['"]([^'"]+)['"]/gim)
        .filter((v: string) => !/^\s+$/.test(v) && v);
    },
    [MODIFIER_COMMA]: (str: string) => {
      return str
        .split(',')
        .filter((v) => !/^\s+$/.test(v) && v)
        .map((v) => v.trim());
    },
    [MODIFIER_CODE]: (str: string) => {
      return [`\`${str}\``];
    },
  };

  if (modifiers.includes(MODIFIER_RAW)) {
    return MODIFIER[MODIFIER_RAW](str);
  }

  if (modifiers && modifiers.length === 0) {
    modifiers.push(MODIFIER_DEFAULT);
  }

  // Filter data layer by layer through modifiers.
  let pipeline: string | string[] = str;
  modifiers.forEach((modifier) => {
    if (typeof pipeline === 'string') {
      pipeline = MODIFIER[modifier](str);
    } else {
      const pipes: string[] = [];

      pipeline.forEach((pipe) => {
        pipes.push(...MODIFIER[modifier](pipe));
      });

      pipeline = pipes;
    }
  });

  return pipeline;
};

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
          // Special parse for `@lc` signs.
          if (/^@lc[\s\S]*/.test(str)) {
            const lines = str.split(/\n/).filter((v) => v);
            const first = lines[0].split(/\s/).filter((v) => v);
            const second = lines[1].split(/\s/).filter((v) => v);

            const lc_id = first[2].replace('id=', '');
            const lc_title = second.slice(1).join(' ');
            const lc_uri = lines[2];
            const lc_lang = first[3].replace('lang=', '');

            Object.assign(store, { lc_id, lc_title, lc_uri, lc_lang });
          }

          opts.signs.forEach((sign: string) => {
            const splitSign = sign.split('.');
            const modifiers = splitSign.slice(1);
            let keywords: string[] = [];

            // Remove modifiers of option.
            if (modifiers && modifiers.length !== 0) {
              sign = splitSign[0];
            }

            // Match sign with the @ prefix.
            if (new RegExp(`^@${sign}\\b([^@]*)`).test(str)) {
              keywords = parseSignWithModifier(RegExp.$1.trim(), modifiers);
              Object.assign(store, { [sign]: keywords.join(', ') });
            }
          });

          return { source: ' @', data: { tag: store } };
        },
      ],
    },
    (error: any, data: any, finish: any) => {
      if (error && error.message) {
        console.error(`TableGT ERR!: ${error.message}`);
      }

      if (data) {
        if (!Object.keys(store).length) {
          console.warn(
            `TableGT WARN: can't find valid MARKER in "${sourcePath}"`,
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
          ...store,
          lc_title: `[${store.lc_title}](${store.lc_uri})`,
          lc_lang: `[${store.lc_lang}](${sourcePath})`,
        };

        // According to the enabled SIGN, generate data sequentially.
        let newTable = '|';
        opts.signsNoModifier.forEach((s: string) => {
          newTable += ` ${sign[s] ? sign[s] : ''} |`;
        });

        if (opts.overwrite) {
          context.cache = `${context.cache}${newTable}\n`;
        }

        let insertContent = '';
        insertContent += `${opts.marker.start}\n`;
        insertContent += `${opts.overwrite ? opts.thead : oldTable}\n`;
        insertContent += `${opts.overwrite ? context.cache : newTable}`;
        insertContent += `${opts.overwrite ? '' : '\n'}${opts.marker.end}`;

        const newFileContent = beforeTable + insertContent + afterTable;

        console.info(`TableGT INFO: start parse "${sourcePath}" file`);
        fse.writeFileSync(targetPath, newFileContent, { encoding: 'utf8' });
        console.info('TableGT DONE: table generate successfully!');
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

class TableGT {
  /**
   * Default configuration.
   * @param {boolean} overwrite     Whether to overwrite old data.
   * @param {Array}   signs         Parsable sign.
   * @param {string}  thead         Table header (Markdown syntax).
   * @param {Object}  marker        Marking point, where data is generated.
   * @param {string}  marker.start
   * @param {string}  marker.end
   */
  private DEFAULT_OPTION = {
    overwrite: true,
    signs: [
      'lc_id',
      'lc_title',
      'level',
      'lc_lang',
      'tags.comma.code',
      'similars.comma.code',
    ],
    thead: `| # | Title | Level | Lang | Tags | Similars |\n| :---: | :--- | :---: | :---: | :---: | :---: |`,
    marker: {
      start: '<!-- @tb-start -->',
      end: '<!-- @tb-end -->',
    },
  };
  // Configuration item.
  public opts: any;
  // The cache data, only be used when `opts.overwrite` is true.
  // Keep the previous table data and pass it to the next generation.
  public cache = '';

  constructor(options: any) {
    this.init(options);
  }

  private init(options: any): void {
    this.opts = Object.assign({}, this.DEFAULT_OPTION, options);
    const signsNoModifier = this.opts.signs.map((s: string) => s.split('.')[0]);
    this.opts.signsNoModifier = signsNoModifier;
  }

  /**
   * Generate table data from some comments.
   * @param sourcePath The path to the file that needs to be parsed.
   * @param targetPath The file path to store the generated data.
   */
  public build(sourcePath: string, targetPath = './README.md'): void {
    if (!sourcePath) {
      console.error(`TableGT ERR!: please pass in parameters.`);
      return;
    }
    if (!fse.existsSync(sourcePath)) {
      console.error(`TableGT ERR!: path "${sourcePath}" is not exist.`);
      return;
    }

    const paths = readPath(sourcePath, sourcePath);

    if (!paths || !paths.length) {
      console.error(`TableGT ERR!: directory "${sourcePath}" is empty.`);
      return;
    }

    if (Array.isArray(paths)) {
      paths.forEach((path: string) => {
        parseComment(path, targetPath, this);
      });
    }
  }
}

module.exports = TableGT;
