const isAuthenticated = imp("app/helpers/isAuthenticated");
const getUser = imp("app/helpers/User/get");
const JWT = imp("app/helpers/JWT");
const cookies = imp("app/helpers/cookies");

module.exports = async (refreshToken, req, res) => {
    let data = {
        accessToken: null,
        refreshToken
    };

    try {

        const authenticated = await isAuthenticated(req)

        if (!authenticated.refreshToken) {
            return data;
        }

        let cookieData = {
            accessToken: null,
            refreshToken: authenticated.tokens.refreshToken,
            time: Date.now(),
        }

        const $user = await getUser({ userId: authenticated.data.refreshToken.userId });

        let tokenData = {}

        for (key in authenticated.data.refreshToken) {
            const val = $user[key]
            if (val != undefined) {
                tokenData[key] = val;
            }
        }

        const newAccessToken = JWT.generate.accessToken(tokenData);
        const cookieName = env("AUTHENTICATION_DATA_COOKIE_NAME") || "USER1AUTH";

        cookieData.accessToken = newAccessToken;

        cookies.sign(res, cookieName, cookieData);

        return cookieData;

    } catch {
        return {};
    }
}