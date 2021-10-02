const getUser = require("./get");
const updateUser = require("./update");


module.exports = async (data = {}, status = "offline") => {

    const $user = await getUser(data);

    if (!$user) {
        return null;
    }

    await updateUser(data, {
        status
    })

    return getUser({ userId: $user.userId })
}