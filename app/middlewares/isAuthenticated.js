const isAuthenticated = imp("app/helpers/isAuthenticated");
const renewAccessToken = imp("app/helpers/renewAccessToken");
const getUser = imp("app/helpers/User/get");

const forbidden = (req, res, next) => {
    req.HANDLE_RESPONSE = true;

    req.HANDLE_DATA = {};

    req.HANDLE_DATA.statusCode = 403;
    req.HANDLE_DATA.data = {
        status: "error",
        statusCode: req.HANDLE_DATA.statusCode,
        code: req.code.FORBIDDEN
    };

    return next();
}


module.exports = async (req, res, next) => {
    req.$user = null;

    try {

        const authenticated = await isAuthenticated(req);

        if (!authenticated.refreshToken) {
            req.$user = null;
            return forbidden(req, res, next);
        }

        if (!authenticated.accessToken && !authenticated.refreshToken) {
            req.$user = null;
            return forbidden(req, res, next);
        }

        if (!authenticated.accessToken && authenticated.refreshToken) {
            const renew = await renewAccessToken(authenticated.refreshToken, req, res)
        }

        req.$user = await getUser({ userId: authenticated?.data?.refreshToken?.userId });

    } catch (e) {
        console.log(e)
    }
    next()
}