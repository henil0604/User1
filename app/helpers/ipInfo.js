const ipInfo = require("ipinfo")


module.exports = async (ip) => {
    return new Promise(resolve => {
        ipInfo(ip, (err, data) => {
            if (err) return resolve(null);

            return resolve(data);
        })

    })

}