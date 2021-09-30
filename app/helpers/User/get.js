const $User = imp("app/Models/User");

module.exports = async (find) => {
    let users = await $User.find(find);

    if (!users) {
        return null;
    }

    if (users.length == 0) {
        return null;
    }

    users = users.length == 1 ? users[0] : users;

    return users;
}