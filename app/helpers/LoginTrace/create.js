const $LoginTrace = imp("app/Models/LoginTrace");

module.exports = async (userId) => {

    const trace = new $LoginTrace({
        userId,
        traces: new Map()
    })

    saved = await trace.save();

    return saved;
}
