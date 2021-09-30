const helperJs = require("@henil0604/helperjs");


module.exports = (seed = helperJs.random(15), sprite = "bottts") => {
    // LINK https://avatars.dicebear.com
    const baseUri = `https://avatars.dicebear.com/api/${sprite}`;

    const uri = `${baseUri}/${seed}.svg`;

    return uri;
}