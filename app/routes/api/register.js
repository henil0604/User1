/* ---------------------------- Importing Modules --------------------------- */
const RegisterValidation = imp("app/validation/Register");
const createUser = imp("app/helpers/User/create");
const getUser = imp("app/helpers/User/get");
const createAvatar = imp("app/helpers/createAvatar");
const helperJs = require("@henil0604/helperjs");
const sendEmail = imp("app/helpers/sendEmail");
const getHTMLTemplate = imp("app/helpers/getHTMLTemplate");


/* -------------------------------------------------------------------------- */
/* ---------------------------- The Main Handler ---------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = async (req, res, next) => {

    // Initializing Response
    req.HANDLE_DATA = {
        // setting statusCode default statusCode to 200
        statusCode: 200,
        // setting response data
        data: {}
    }

    // setting the HANDLE_RESPONSE to true for letting the responseHandler know to handle the response
    req.HANDLE_RESPONSE = true;

    // try catch block for handling errors
    try {

        // Initilizing Data
        let data = req.body;

        // adding `createdBy`
        data.createdBy = req.clientIp;

        // adding avatarUri
        data.avatarId = `${data.username}${Date.now()}`;

        // validating data
        data = RegisterValidation.validate(data);

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
                // shows the message which JOI throws
                message: "\"password\" is required"
            }
            return next();
        }

        // check if method is "NOT" `auth` and there is "authId" field in it
        if (data.method != "auth" && helperJs._.is.not(data.password)) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.VALIDATION_ERROR,
                // shows the message which JOI throws
                message: "\"authId\" is required"
            }
            return next();
        }

        // set `userId` with help of `helperJs.random`
        data.userId = helperJs.random(32)

        // get the user with username got from request data
        const userWithUsername = await getUser({ username: data.username });
        const userWithEmail = await getUser({ email: data.email });

        /* 
            check if userwithUsername and userWithEmail
            is not null means there is already
            a user with same username and same email
            which got from request data
        */
        if (userWithUsername != null || userWithEmail != null) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.DATA_CONFLICT,
                message: `${userWithUsername != null ? "Username" : "Email"} is taken`
            }
            return next()
        }


        const $user = await createUser(data);

        if ($user.userId != data.userId) {
            req.HANDLE_DATA.statusCode = 422;
            req.HANDLE_DATA.data = {
                status: "error",
                statusCode: req.HANDLE_DATA.statusCode,
                code: req.code.FAILED,
                message: `Failed to Register`
            }
            return next()
        }

        req.HANDLE_DATA.statusCode = 201;
        req.HANDLE_DATA.data = {
            status: "success",
            statusCode: req.HANDLE_DATA.statusCode,
            code: req.code.CREATED,
            message: `Successfuly Registered`,
            data: {
                status: $user.status,
                verifiedBy: $user.verifiedBy,
                username: $user.username,
                email: $user.email,
                method: $user.method,
                avatarId: $user.avatarId,
                userId: $user.userId,
                createdAt: $user.createdAt,
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
            message: e.message
        };
    }

    // calling the next handler - here it is responseHandler
    next()
}