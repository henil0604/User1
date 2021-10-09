const $LoginTrace = imp("app/Models/LoginTrace");
const getLoginTrace = require("./get");

module.exports = async (userId, traceId) => {

    const loginTrace = await getLoginTrace({
        userId
    })

    if (!loginTrace) return null

    loginTrace.traces.set(traceId, {
        ...loginTrace.traces.get(traceId),
        active: false
    });

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