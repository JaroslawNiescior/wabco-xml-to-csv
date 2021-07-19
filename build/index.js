"use strict";
// import { readdirSync, readFileSync } from "fs";
// import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
// import { parseString } from "xml2js";
// import { ObjectMap } from "csv-writer/src/lib/lang/object";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const redex = [/\n/gi, /\r/gi];
// [...readdirSync(`source/`)].forEach((module, moduleId) => {
//   const data: ObjectMap<any>[] = [];
//   console.log(module);
//   [...readdirSync(`source/${module}/en/`)]
//     .filter(checkSettings)
//     .forEach((fileName, fileId) => {
//       console.log(fileName, fileId);
//       parseString(
//         readFileSync(`source/${module}/en/${fileName}`),
//         { mergeAttrs: true },
//         (err, result) => {
//           if (err) {
//             throw err;
//           }
//           result["textfields"].tf.forEach((tf: { [x: string]: string; }) => {
//             const text = tf["_"].replace(redex[0], "").replace(redex[1], "");
//             console.log(text);
//             let object = {
//               id: fileId + 1,
//               slide_nr: parseInt(fileName.substring(9, 13)),
//               screen_nr: parseInt(fileName.substring(14, 16)),
//               speech_nr: parseInt(fileName.substring(16, 18)),
//               text: text,
//             };
//             data.push(object);
//           });
//         },
//       );
//     });
//   const csvWriter = createCsvWriter({
//     path: `return/${module}.csv`,
//     header: [
//       { id: "id", title: "ID" },
//       { id: "slide_nr", title: "Slide Nr" },
//       { id: "screen_nr", title: "Screen Nr" },
//       { id: "text", title: "EN_Text" },
//     ],
//     fieldDelimiter: ";",
//   });
//   csvWriter
//     .writeRecords(data)
//     .then(() => console.log("The CSV file was written successfully"));
// });
// function checkSettings(element: string | string[]) {
//   return (
//     !element.includes("_a_") &&
//     !element.includes(".swf") &&
//     element.includes("sco_ecas_")
//   );
// }
// //  TODO: zip -> xml -> csv
var unzipper_1 = __importDefault(require("unzipper"));
var fs_1 = __importDefault(require("fs"));
fs_1.default.createReadStream('output/source/ECAS_K2_EN_3_tree.zip')
    .pipe(unzipper_1.default.Parse())
    .on('entry', function (entry) {
    var filePath = entry.path;
    if (filePath.split('.')[1] === "xml") {
        console.log(filePath.split('.')[1]);
        entry.pipe(fs_1.default.createWriteStream('output/path'));
    }
    else {
        entry.autodrain();
    }
});
