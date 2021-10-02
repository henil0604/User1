const $LoginTrace = imp("app/Models/LoginTrace");

module.exports = async (find) => {
    let loginTraces = await $LoginTrace.find(find);

    if (!loginTraces) {
        return null;
    }

    if (loginTraces.length == 0) {
        return null;
    }

    loginTraces = loginTraces.length == 1 ? loginTraces[0] : loginTraces;

    return loginTraces;
}