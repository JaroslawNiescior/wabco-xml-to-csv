"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var csv_writer_1 = require("csv-writer");
var xml2js_1 = require("xml2js");
var redex = [/\n/gi, /\r/gi];
__spreadArray([], fs_1.readdirSync("source/")).forEach(function (module, moduleId) {
    var data = [];
    console.log(module);
    __spreadArray([], fs_1.readdirSync("source/" + module + "/en/")).filter(checkSettings)
        .forEach(function (fileName, fileId) {
        console.log(fileName, fileId);
        xml2js_1.parseString(fs_1.readFileSync("source/" + module + "/en/" + fileName), { mergeAttrs: true }, function (err, result) {
            if (err) {
                throw err;
            }
            result["textfields"].tf.forEach(function (tf) {
                var text = tf["_"].replace(redex[0], "").replace(redex[1], "");
                console.log(text);
                var object = {
                    id: fileId + 1,
                    slide_nr: parseInt(fileName.substring(9, 13)),
                    screen_nr: parseInt(fileName.substring(14, 16)),
                    speech_nr: parseInt(fileName.substring(16, 18)),
                    text: text,
                };
                data.push(object);
            });
        });
    });
    var csvWriter = csv_writer_1.createObjectCsvWriter({
        path: "return/" + module + ".csv",
        header: [
            { id: "id", title: "ID" },
            { id: "slide_nr", title: "Slide Nr" },
            { id: "screen_nr", title: "Screen Nr" },
            { id: "text", title: "EN_Text" },
        ],
        fieldDelimiter: ";",
    });
    csvWriter
        .writeRecords(data)
        .then(function () { return console.log("The CSV file was written successfully"); });
});
function checkSettings(element) {
    return (!element.includes("_a_") &&
        !element.includes(".swf") &&
        element.includes("sco_ecas_"));
}
