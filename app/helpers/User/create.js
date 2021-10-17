const $User = imp("app/Models/User");
const createLoginTrace = imp("app/helpers/LoginTrace/create");

module.exports = async (data) => {

    const $user = new $User(data);

    await createLoginTrace(data.userId)

    return await $user.save();
}
