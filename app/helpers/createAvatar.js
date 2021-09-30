const sprite = "bottts";
const baseUri = `https://avatars.dicebear.com/api/${sprite}`;

module.exports = (username) => {

    const seed = `${username}-${Date.now()}`;

    const uri = `${baseUri}/${seed}.svg`;

    return uri;
}