const getUser = require("./get");
const $User = imp("app/Models/User");


module.exports = async (data = {}, update) => {

    const $user = await getUser(data);

    if (!$user) {
        return null;
    }

    return $User.findOneAndUpdate(data, {
        $set: {
            ...update
        }
    })
}