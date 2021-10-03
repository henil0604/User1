/* ---------------------------- Importing Modules --------------------------- */
const LoginValidation = imp("app/validation/Login");
const helperJs = require("@henil0604/helperjs")
const getUser = imp("app/helpers/User/get");
const setUserStatus = imp("app/helpers/User/setStatus");
const bcrypt = require("bcrypt");
const JWT = imp("app/helpers/JWT");
const addLoginTrace = imp("app/helpers/LoginTrace/add");
const sendEmail = imp("app/helpers/sendEmail");
const getHTMLTemplate = imp("app/helpers/getHTMLTemplate");
const getActiveLogins = imp("app/helpers/User/getActiveLogins");
const ipInfo = imp("app/helpers/ipInfo");
const cookies = imp("app/helpers/cookies");

/* -------------------------------------------------------------------------- */
// Handler that allows to send "Security Warning"s According to user's data ----
/* -------------------------------------------------------------------------- */
const sendWarningMail = async (req, $user) => {
    const userLocationInfo = await ipInfo(req.clientIp);

    const data = {
        email: $user.email,
        username: $user.username,
        ip: req.clientIp,
        loggedInAt: new Date(),
        location: "Unknown",
        device: "Unknown"
    }

    if (userLocationInfo != null && !userLocationInfo?.bogon && userLocationInfo.region && userLocationInfo.country && userLocationInfo.city) {
        data.location = `${userLocationInfo.city}, ${userLocationInfo.region}, ${userLocationInfo.country}`
    }


    if (req.useragent != undefined && req.useragent.isDesktop != undefined && req.useragent.os != undefined && req.useragent.browser != undefined && req.useragent.isMobile != undefined) {
        data.device = "";

        if (req.useragent.isDesktop) {
            data.device += `Desktop`
        } else if (req.useragent.isMobile) {
            data.device += `Mobile`
        } else {
            data.device += "Other"
        }

        data.device += ", ";

        data.device += req.useragent.browser + ", ";
        data.device += req.useragent.os;
    }

    const html = getHTMLTemplate("loginWarning", data);

    return sendEmail({
        to: data.email,
        subject: "Security Warning",
        html
    })

}

/* -------------------------------------------------------------------------- */
// Handler that allows to set tokens as cookies for user
/* -------------------------------------------------------------------------- */
const setCookies = (res, tokens) => {

    const data = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        time: Date.now()
    }

    const cookieName = env("AUTHENTICATION_DATA_COOKIE_NAME") || "USER1AUTH"

    return cookies.sign(res, cookieName, data)
}

/* -------------------------------------------------------------------------- */
/* ------------------------------ Main Handler ------------------------------ */
/* -------------------------------------------------------------------------- */
module.exports = async (req, res, next) => {

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

        // Initilizing Data
        let data = req.body;

        // validating data
        data = LoginValidation.validate(data);

        // if got error while validating
        if (data.error) {
            // set the statusCode to 422
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.VALIDATION_ERROR,
                // shows the message which JOI throws
                message: data.error.details[0].message
            }
            return next()
        }

        // Set the retruned value form JOI as data
        data = data.value;

        // check if method is `auth` and there is "password" field in it
        if (data.method == "auth" && helperJs._.is.not(data.password)) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.VALIDATION_ERROR,
                message: "\"password\" is required"
            }
            return next();
        }

        // check if method is "NOT" `auth` and there is "authId" field in it
        if (data.method != "auth" && helperJs._.is.not(data.authId)) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.VALIDATION_ERROR,
                message: "\"authId\" is required"
            }
            return next();
        }

        // check if email exists
        const userWithEmail = await getUser({ email: data.email })

        if (userWithEmail == null) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.INVALID_DATA,
                message: `User Not Found`
            }
            return next()
        }

        let $user = userWithEmail;

        // Check for method
        if ($user.method != data.method) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.DATA_CONFLICT,
                message: `Invalid Method. Expected: ${$user.method}`
            }
            return next();
        }


        // check for password
        if ($user.method == "auth") {
            const isPasswordMatched = await bcrypt.compare(data.password, $user.password)

            // if password is not matched,
            if (!isPasswordMatched) {
                req.HANDLE_DATA.statusCode = 422;
                req.HANDLE_DATA.data = {
                    status: "error",
                    statusCode: req.HANDLE_DATA.statusCode,
                    code: req.code.INVALID_DATA,
                    message: `Incorrect Password`
                }
                return next()
            }
        }

        // check for authId
        if ($user.method != "auth") {
            const isAuthIdMatched = await bcrypt.compare(data.authId, $user.authId)

            // if authId is not matched,
            if (!isAuthIdMatched) {
                req.HANDLE_DATA.statusCode = 422;
                req.HANDLE_DATA.data = {
                    status: "error",
                    statusCode: req.HANDLE_DATA.statusCode,
                    code: req.code.INVALID_DATA,
                    message: `Incorrect Auth Id`
                }
                return next()
            }
        }

        const findUserData = {
            userId: $user.userId
        }

        // set the user status to online
        const userWithNewStatus = await setUserStatus(findUserData, "online")

        // checking if updating status was successful
        if (userWithNewStatus.status != "online") {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.FAILED,
                message: `Failed to update status`
            }
            return next()
        }

        $user = userWithNewStatus;

        // Preparing Data
        const $userData = {
            email: $user.email,
            username: $user.username,
            method: $user.method,
            createdAt: $user.createdAt,
            verifiedBy: $user.verifiedBy,
            userId: $user.userId,
            avatarId: $user.avatarId,
        }

        // Generating JSON WEB TOKENS
        const tokens = {
            accessToken: JWT.generate.accessToken($userData),
            refreshToken: JWT.generate.refreshToken($userData),
        }

        if (!tokens.accessToken || !tokens.refreshToken) {
            req.HANDLE_DATA.statusCode = 500;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.FAILED,
                message: `Failed to Generate Authentication Tokens`
            }
            return next()
        }

        const activeLogins = await getActiveLogins($userData.userId);

        if (activeLogins.length >= (parseInt(env("MAX_ACTIVE_LOGIN_LIMIT")) || 5)) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.EXCEEDED,
                message: `Active Login Limit exceedxed`
            }
            return next()
        }

        const loginTrace = {
            time: Date.now(),
            traceId: helperJs.random(87),
            refreshToken: tokens.refreshToken,
            ip: req.clientIp,
            active: true
        }

        const updatedTrace = await addLoginTrace($userData.userId, loginTrace);

        if (!updatedTrace.traces.has(loginTrace.traceId)) {
            req.HANDLE_DATA.statusCode = 500;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.FAILED,
                message: `Failed to Generate Login Trace`
            }
            return next()
        }

        sendWarningMail(req, $user)
        setCookies(res, tokens);

        req.HANDLE_DATA.statusCode = 202;
        req.HANDLE_DATA.data = {
            status: "success",
            statusCode: req.HANDLE_DATA.statusCode,
            code: req.code.SUCCESS,
            message: `Successfuly Logged In`,
            data: {
                ...tokens
            }
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