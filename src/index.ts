import fse from 'fs-extra';
import comments from 'comment-parser';

const TAG_TYPES = ['level', 'tags', 'similars'];
const MARKER_START = '<!-- @tb-start -->';
const MARKER_END = '<!-- @tb-end -->';

const parseComment = function parseComment(
  sourcePath: string,
  targetPath: string,
): any {
  const tags: any = {};

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
            const topic = second.slice(1).join(' ');
            const uri = lines[2];

            Object.assign(tags, { id, lang, topic, uri });
          }

          TAG_TYPES.forEach((type: string) => {
            if (new RegExp(`^@${type}[\\s\\S]*`).test(str)) {
              const keys = str
                .split(/['"]([^'"]+)['"]/gi)
                .filter((key) => !/^\s+$/.test(key) && key !== '')
                .slice(1);

              Object.assign(tags, { [type]: keys });
            }
          });

          return { source: ' @', data: { tag: tags } };
        },
      ],
    },
    (error: any, data: any, finish: any) => {
      if (error && error.message) {
        console.error(error.message);
      }

      if (data) {
        if (!Object.keys(tags).length) {
          console.info("TBuilder INFO: can't find valid tag in target file");
          return;
        }

        // If file not exist, create it. If exist, ignore.
        fse.ensureFileSync(targetPath);

        const fileBuffer = fse.readFileSync(targetPath);
        const fileContent = Buffer.from(fileBuffer).toString();

        const startPos = fileContent.indexOf(MARKER_START);
        const endPos = fileContent.indexOf(MARKER_END);

        let insertContent = '';
        const beforeContent = fileContent.slice(0, startPos);
        const afterContent = fileContent.slice(endPos + MARKER_END.length);
        const targetContent = fileContent
          .slice(startPos + MARKER_START.length, endPos)
          .trim();

        let levelStr = '';
        let tagStr = '';
        let similarStr = '';

        if (tags.level) {
          levelStr = tags.level;
        }
        if (Array.isArray(tags.tags) && tags.tags.length) {
          tags.tags.forEach((tag: string) => {
            tagStr += `\`${tag}\`, `;
          });
          tagStr = tagStr.trim().slice(0, -1);
        }
        if (Array.isArray(tags.similars) && tags.similars.length) {
          tags.similars.forEach((similar: string) => {
            similarStr += `\`${similar}\`, `;
          });
          similarStr = similarStr.trim().slice(0, -1);
        }

        insertContent += `${MARKER_START}\n${targetContent}\n`;
        insertContent += `|${tags.id}|[${tags.topic}](${tags.uri})|${levelStr}|[${tags.lang}](${sourcePath})|${tagStr}|${similarStr}|`;
        insertContent += `\n${MARKER_END}`;

        const newFileContent = beforeContent + insertContent + afterContent;

        console.log('TBuilder INFO: start generate table by comments...');
        fse.writeFileSync(targetPath, newFileContent, { encoding: 'utf8' });
        console.log('TBuilder INFO: table generate successfully!');
      }

      if (finish) {
        console.info(finish);
      }
    },
  );

  return tags;
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

class TBuilder {
  constructor(options: unknown) {
    const DEFAULT_OPTS = {
      // 是否重新生成并覆盖原来所有的数据
      // TODO: 目前只能重新覆盖所有
      overwrite: false,
    };
    const opts: any = Object.assign({}, DEFAULT_OPTS, options);
    console.log('Your config: ', opts);
  }

  build(sourcePath: string, targetPath: string): void {
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
        parseComment(sourcePath, targetPath);
      });
    }
  }
}

const tbuilder = new TBuilder({ overwrite: true });
tbuilder.build('./javascript', './README.md');
