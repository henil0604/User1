const chalk = require("chalk");
const env = require("./env");
const path = require("path");
var appRoot = require('app-root-path');
const fs = require('fs');

let defaultPrefix = ">";

let fileLog = (data) => {

    const logPath = data.FILE_LOG_PATH || env("FILE_LOG_PATH")

    if (!logPath) return false;

    let dir = path.join(appRoot.toString(), logPath);

    data.FILE_LOG_PATH ? delete data.FILE_LOG_PATH : null;
    data.logTime = Date.now();

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let logFile = path.join(dir, `${parseInt(Date.now() / 1000 / 60 / 60)}.json`);


    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, "[]")
    }

    let pastData = JSON.parse(fs.readFileSync(logFile, "utf8"));

    pastData.push(data);

    fs.writeFileSync(
        logFile,
        JSON.stringify(pastData)
    )

}

let log = (data = "", status = "info", prefix = defaultPrefix, fileLogging = env("FILE_LOG_PATH")) => {
    const canBeLogged = env("LOG") == undefined || env("LOG") == null ? true : env("LOG")

    if (!canBeLogged) {
        return;
    }
    data.__proto__.canBeFormatted = true;

    if (typeof data == "object") {
        try {
            data = JSON.stringify(data);
            data.__proto__.canBeFormatted = false;
        } catch { }
    }

    let t = `${prefix} `;
    let color = chalk.whiteBright;

    if (status == "log") {
        color = chalk.whiteBright
    }
    if (status == "success") {
        color = chalk.greenBright;
    }
    if (status == "info") {
        color = chalk.cyanBright;
    }
    if (status == "warn") {
        color = chalk.yellowBright;
    }
    if (status == "error") {
        color = chalk.redBright;
    }

    t = color(t)

    t += data;

    if (
        data.__proto__.canBeFormatted &&
        /\{(.*)\}/g.test(data)
    ) {
        const reg = /\{(.*)\}/g;
        const insideData = data.match(reg)
        insideData.forEach(e => {
            const formattedString = e.replace(/\{|\}/g, ``)
            const coloredString = color(formattedString);
            t = t.replace(e, coloredString);
        })
    }

    console.log(t);

    if (fileLogging) {
        try {
            fileLog({
                data,
                status,
                FILE_LOG_PATH: fileLogging
            })
        } catch { }
    }
}

log.__proto__.setDefaultPrefix = (prefix = "") => { defaultPrefix = prefix };
log.__proto__.chalk = chalk;
log.__proto__.fileLog = fileLog;


module.exports = log;