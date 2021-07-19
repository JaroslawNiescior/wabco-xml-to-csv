import {
  createReadStream,
  createWriteStream,
  readdirSync,
  readFileSync,
  existsSync,
  mkdirSync,
} from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { parseString } from 'xml2js';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import unzip, { Entry } from 'unzipper';
import path from 'path';
import cliProgress from 'cli-progress';

const APP_DIRECTORY = '.';
const SOURCE_PATH = `${APP_DIRECTORY}/source`;

const REGEX_EMPTY = [/\n/gi, /\r/gi];

const bar = new cliProgress.Bar({
  barCompleteChar: '#',
  barIncompleteChar: '.',
  fps: 5,
  stream: process.stdout,
  barsize: 65
});
bar.start([...readdirSync(SOURCE_PATH)].length * 100, 0, {
  speed: 100
});
[...readdirSync(SOURCE_PATH)].forEach((module) => {
  const MODULE_NAME = fileProperties(module).fileName;
  const MODULE_PATH = `${APP_DIRECTORY}/source/${module}`;
  const UNZIPED_PATH = `${APP_DIRECTORY}/unzpied/${MODULE_NAME}`;
  bar.update(100);
  createReadStream(MODULE_PATH)
    .pipe(unzip.Parse())
    .on('entry', (entry: Entry) => {
      if (entry.path) {
        const filePath = {
          fullPath: entry.path,
          fileName: entry.path.replace(/^.*[\\\/]/, ''),
          dirName: path.dirname(entry.path),
        };
        if (
          filePath.fileName.split('.')[1] === 'xml' &&
          filePath.dirName === 'en' &&
          !filePath.fileName.includes('stringtable')
        ) {
          const FILE_DIRECTORY = `${UNZIPED_PATH}/${
            filePath.fileName.includes('_a_') ? 'audio' : 'screen'
          }`;

          if (!existsSync(FILE_DIRECTORY)) {
            mkdirSync(FILE_DIRECTORY, { recursive: true });
          }
          entry.pipe(
            createWriteStream(`${FILE_DIRECTORY}/${filePath.fileName}`),
          );
        } else {
          entry.autodrain();
        }
      }
    });
});
setTimeout(() => {
  bar.stop();
  [...readdirSync(`${APP_DIRECTORY}/unzpied/`)].forEach((module) => {
    const data: ObjectMap<any>[] = [];
    console.log(module);
    [...readdirSync(`${APP_DIRECTORY}/unzpied/${module}`)].forEach((table) => {
      bar.start([...readdirSync(`${APP_DIRECTORY}/unzpied/${module}/${table}`)].length, 0);
      [...readdirSync(`${APP_DIRECTORY}/unzpied/${module}/${table}`)].forEach(
        (fileName, fileId) => {
          console.log(fileName, fileId);
          parseString(
            readFileSync(
              `${APP_DIRECTORY}/unzpied/${module}/${table}/${fileName}`,
            ),
            { mergeAttrs: true },
            (err, result) => {
              if (err) {
                throw err;
              }
              if (table === 'screen' && fileName != 'manifest_en.xml') {
                result['textfields'].tf.forEach(
                  (tf: { [x: string]: string }) => {
                    const text = tf['_']
                      .replace(REGEX_EMPTY[0], '')
                      .replace(REGEX_EMPTY[1], '');
                    console.log(text);
                    let object = {
                      id: fileId + 1,
                      slide_nr: parseInt(fileName.substring(9, 13)),
                      screen_nr: parseInt(fileName.substring(14, 16)),
                      speech_nr: parseInt(fileName.substring(16, 18)),
                      text: text,
                    };
                    bar.increment();
                    data.push(object);
                  },
                );
              }
            },
          );
        },
      );
    });

    const csvWriter = createCsvWriter({
      path: `return/${module}.csv`,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'slide_nr', title: 'Slide Nr' },
        { id: 'screen_nr', title: 'Screen Nr' },
        { id: 'text', title: 'EN_Text' },
      ],
      fieldDelimiter: ';',
    });

    csvWriter
      .writeRecords(data)
      .then(() => console.log('The CSV file was written successfully'));
  });
}, 2000);
console.log("DONE!")
bar.stop();

function fileProperties(entry: string): {
  fileName: string;
  fileExtension: string;
} {
  return {
    fileName: entry.split('.')[0],
    fileExtension: entry.split('.')[1],
  };
}
