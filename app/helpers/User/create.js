const $User = imp("app/Models/User");

module.exports = (data) => {

    const $user = new $User(data);

    return $user.save();
}