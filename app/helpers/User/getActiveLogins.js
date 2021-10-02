const getLoginTrace = imp("app/helpers/LoginTrace/get");

module.exports = async (userId) => {
    const final = [];

    const $loginTrace = await getLoginTrace({ userId })

    if (!$loginTrace) {
        return final;
    }

    $loginTrace.traces.forEach(trace => {
        if (trace.active == true) {
            final.push(trace);
        }
    })


    return final;
}