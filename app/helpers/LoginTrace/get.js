const $LoginTrace = imp("app/Models/LoginTrace");

module.exports = async (find) => {
    let loginTraces = await $LoginTrace.findOne(find);

    if (!loginTraces) {
        return null;
    }

    return loginTraces;
}
