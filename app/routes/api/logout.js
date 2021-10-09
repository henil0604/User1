/* ---------------------------- Importing Modules --------------------------- */
const isAuthenticated = imp("app/helpers/isAuthenticated");
const getActiveLogins = imp("app/helpers/User/getActiveLogins");
const makeInactiveLoginTrace = imp("app/helpers/LoginTrace/makeInactive");
const cookies = imp("app/helpers/cookies");
const setUserStatus = imp("app/helpers/User/setStatus");


/* -------------------------------------------------------------------------- */
/* ------------------ Main Handler For handling /api/logout ----------------- */
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

        const { tokens } = await isAuthenticated(req);

        let activeLogins = await getActiveLogins(req.$user.userId);
        let targetTrace = null;

        activeLogins.forEach(e => {
            if (e.refreshToken == tokens.refreshToken) {
                targetTrace = e;
            }
        })

        await makeInactiveLoginTrace(req.$user.userId, targetTrace.traceId);

        const cookieName = env("AUTHENTICATION_DATA_COOKIE_NAME") || "USER1AUTH";

        cookies.sign(res, cookieName, "");

        activeLogins = await getActiveLogins(req.$user.userId);
        if (activeLogins.length == 0) {
            await setUserStatus({ userId: req.$user.userId }, "offline");
        }

        req.HANDLE_DATA.statusCode = 202;
        req.HANDLE_DATA.data = {
            status: "success",
            statusCode: req.HANDLE_DATA.statusCode,
            code: req.code.ACCEPTED,
            message: "Logged Out"
        }

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