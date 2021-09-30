const fs = require("fs");


module.exports = (template, data = {}) => {


    try {
        let html = fs.readFileSync(
            `${__dirname}/../templates/${template}.html`
        );

        html = html.toString();

        for (key of Object.keys(data)) {
            let regex = new RegExp(`{${key}}`, "g");
            html = html.replace(regex, data[key]);
        }

        return html;
    } catch (e) {
        return '';
    }
}