"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var csv_writer_1 = require("csv-writer");
var xml2js_1 = require("xml2js");
var unzipper_1 = __importDefault(require("unzipper"));
var path_1 = __importDefault(require("path"));
var cli_progress_1 = __importDefault(require("cli-progress"));
var APP_DIRECTORY = '.';
var SOURCE_PATH = APP_DIRECTORY + "/source";
var REGEX_EMPTY = [/\n/gi, /\r/gi];
var bar = new cli_progress_1.default.Bar({
    barCompleteChar: '#',
    barIncompleteChar: '.',
    fps: 5,
    stream: process.stdout,
    barsize: 65
});
bar.start(__spreadArray([], fs_1.readdirSync(SOURCE_PATH)).length * 100, 0, {
    speed: 100
});
__spreadArray([], fs_1.readdirSync(SOURCE_PATH)).forEach(function (module) {
    var MODULE_NAME = fileProperties(module).fileName;
    var MODULE_PATH = APP_DIRECTORY + "/source/" + module;
    var UNZIPED_PATH = APP_DIRECTORY + "/unzpied/" + MODULE_NAME;
    bar.update(100);
    fs_1.createReadStream(MODULE_PATH)
        .pipe(unzipper_1.default.Parse())
        .on('entry', function (entry) {
        if (entry.path) {
            var filePath = {
                fullPath: entry.path,
                fileName: entry.path.replace(/^.*[\\\/]/, ''),
                dirName: path_1.default.dirname(entry.path),
            };
            if (filePath.fileName.split('.')[1] === 'xml' &&
                filePath.dirName === 'en' &&
                !filePath.fileName.includes('stringtable')) {
                var FILE_DIRECTORY = UNZIPED_PATH + "/" + (filePath.fileName.includes('_a_') ? 'audio' : 'screen');
                if (!fs_1.existsSync(FILE_DIRECTORY)) {
                    fs_1.mkdirSync(FILE_DIRECTORY, { recursive: true });
                }
                entry.pipe(fs_1.createWriteStream(FILE_DIRECTORY + "/" + filePath.fileName));
            }
            else {
                entry.autodrain();
            }
        }
    });
});
setTimeout(function () {
    bar.stop();
    __spreadArray([], fs_1.readdirSync(APP_DIRECTORY + "/unzpied/")).forEach(function (module) {
        var data = [];
        console.log(module);
        __spreadArray([], fs_1.readdirSync(APP_DIRECTORY + "/unzpied/" + module)).forEach(function (table) {
            bar.start(__spreadArray([], fs_1.readdirSync(APP_DIRECTORY + "/unzpied/" + module + "/" + table)).length, 0);
            __spreadArray([], fs_1.readdirSync(APP_DIRECTORY + "/unzpied/" + module + "/" + table)).forEach(function (fileName, fileId) {
                console.log(fileName, fileId);
                xml2js_1.parseString(fs_1.readFileSync(APP_DIRECTORY + "/unzpied/" + module + "/" + table + "/" + fileName), { mergeAttrs: true }, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    if (table === 'screen' && fileName != 'manifest_en.xml') {
                        result['textfields'].tf.forEach(function (tf) {
                            var text = tf['_']
                                .replace(REGEX_EMPTY[0], '')
                                .replace(REGEX_EMPTY[1], '');
                            console.log(text);
                            var object = {
                                id: fileId + 1,
                                slide_nr: parseInt(fileName.substring(9, 13)),
                                screen_nr: parseInt(fileName.substring(14, 16)),
                                speech_nr: parseInt(fileName.substring(16, 18)),
                                text: text,
                            };
                            bar.increment();
                            data.push(object);
                        });
                    }
                });
            });
        });
        var csvWriter = csv_writer_1.createObjectCsvWriter({
            path: "return/" + module + ".csv",
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
            .then(function () { return console.log('The CSV file was written successfully'); });
    });
}, 2000);
console.log("DONE!");
bar.stop();
function fileProperties(entry) {
    return {
        fileName: entry.split('.')[0],
        fileExtension: entry.split('.')[1],
    };
}
