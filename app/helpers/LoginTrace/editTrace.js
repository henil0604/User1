const getLoginTrace = require("./get");
const $LoginTrace = imp("app/Models/LoginTrace");


module.exports = async (userId, traceId, update = {}) => {

    const loginTrace = await getLoginTrace({
        userId
    })

    if (!loginTrace) return null

    let foundedTrace = loginTrace.traces.get(traceId)

    foundedTrace = {
        ...foundedTrace,
        ...update
    }

    loginTrace.traces.set(traceId, foundedTrace);

    await $LoginTrace.findOneAndUpdate({
        userId,
        $set: {
            traces: loginTrace.traces
        }
    })

    return getLoginTrace({
        userId
    })
}