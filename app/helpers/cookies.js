const env = require("./env");
const cookieParser = require("cookie-parser");
const cookies = {};


// Signs a cookie to response headers
cookies.sign = (res, key, value, options = {}) => {
    options = {
        ...options,
        sign: true
    }
    return res.cookie(key, value, options)
}


// Initialize Cookie Parser
cookies.init = (app) => {
    const secret = env("COOKIE_SECRET");

    if (!secret) {
        throw "COOKIE_SECRET Not Found";
    }

    app.use(cookieParser(secret))
}



module.exports = cookies;