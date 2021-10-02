const $LoginTrace = imp("app/Models/LoginTrace");

module.exports = async (userId) => {

    const trace = new $LoginTrace({
        userId,
        traces: {}
    })

    return trace.save();
}