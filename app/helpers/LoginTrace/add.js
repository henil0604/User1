const getLoginTrace = require("./get");
const $LoginTrace = imp("app/Models/LoginTrace");


module.exports = async (userId, trace) => {

    const loginTrace = await getLoginTrace({
        userId
    })

    if (!loginTrace) return null

    loginTrace.traces.set(trace.traceId, trace);

    await $LoginTrace.findOneAndUpdate({ userId }, {
        $set: {
            traces: loginTrace.traces
        }
    })

    return await getLoginTrace({
        userId
    })
}