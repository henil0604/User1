module.exports = (req, res, next) => {
    req.HANDLED = false;
    if (req.HANDLE_RESPONSE == true && (typeof req.HANDLE_DATA == "object" &&
        !Array.isArray(req.HANDLE_DATA))) {

        req.resolve(req.HANDLE_DATA?.data, req.HANDLE_DATA?.statusCode, req.HANDLE_DATA?.json);

        req.HANDLED = true;

    }
    next();
}