const JWT = imp("app/helpers/JWT");
const getUserActiveLogins = imp("app/helpers/User/getActiveLogins");

/* -------------------------------------------------------------------------- */
// Main Handler for Checking if request contains correct authentication data
/* -------------------------------------------------------------------------- */
module.exports = async (req) => {

    const cookieName = env("AUTHENTICATION_DATA_COOKIE_NAME") || "USER1AUTH";

    const cookie = req.cookies[cookieName];

    let returnData = {
        accessToken: false,
        refreshToken: false,
        tokens: {
            accessToken: cookie?.accessToken || null,
            refreshToken: cookie?.refreshToken || null,
        },
        data: {
            accessToken: null,
            refreshToken: null,
        }
    };

    if (!cookie) {
        return returnData;
    }

    try {

        if (!cookie.accessToken || !cookie.refreshToken) {
            return returnData;
        }

        const accessTokenVerification = JWT.verify.accessToken(cookie.accessToken);
        const refreshTokenVerification = JWT.verify.refreshToken(cookie.refreshToken);

        if (accessTokenVerification) {
            returnData.accessToken = true;
            returnData.data.accessToken = accessTokenVerification
        }

        if (refreshTokenVerification && refreshTokenVerification.userId) {

            returnData.refreshToken = true;
            returnData.data.refreshToken = refreshTokenVerification

            const actives = await getUserActiveLogins(refreshTokenVerification.userId);
            let isRefreshTokenActive = false;

            for (let i = 0; i < actives.length; i++) {
                if (actives[i].refreshToken == cookie.refreshToken) {
                    isRefreshTokenActive = true;
                    break;
                }
            }

            if (!isRefreshTokenActive) {
                returnData.refreshToken = false;
                returnData.data.refreshToken = null
            }

        }

    } catch (e) {
        console.log(e)
    }

    return returnData;

}