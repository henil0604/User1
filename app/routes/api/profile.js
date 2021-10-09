
/* -------------------------------------------------------------------------- */
/* ------------------------------ Main Handler ------------------------------ */
/* -------------------------------------------------------------------------- */
module.exports = async (req, res, next) => {

    if (!req.$user) {
        return next();
    }

    // Initializing Response
    req.HANDLE_DATA = {
        // setting statusCode default statusCode to 200
        statusCode: 200,
        // setting response data
        data: {}
    }


    req.HANDLE_RESPONSE = true;
    // setting the HANDLE_RESPONSE to true for letting the responseHandler know to handle the response

    // try catch block for handling errors
    try {

        const data = {
            username: req.$user.username,
            email: req.$user.email,
            status: req.$user.status,
            verifiedBy: req.$user.verifiedBy,
            method: req.$user.method,
            avatarId: req.$user.avatarId,
            createdAt: req.$user.createdAt,
        }

        req.HANDLE_DATA.statusCode = 200;
        req.HANDLE_DATA.data = {
            status: "success",
            statusCode: req.HANDLE_DATA.statusCode,
            code: req.code.GIVEN,
            data
        };

    } catch (e) {
        // setting the statusCode to 500 - Internal Server Error
        req.HANDLE_DATA.statusCode = 500;
        // setting the response data
        req.HANDLE_DATA.data = {
            status: "error",
            statusCode: req.HANDLE_DATA.statusCode,
            code: req.code.SOMETHING_WENT_WRONG,
        };

        if (env("SERVER_MODE") == "dev") {
            console.log(e)
            req.HANDLE_DATA.data.message = e.message;
        }

    }

    // calling the next handler - here it is responseHandler
    next()


}