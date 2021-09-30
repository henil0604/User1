const mongo = require("../helpers/mongo");
const resolveRequest = require("../helpers/resolveRequest");
const createResponse = require("../helpers/createResponse");
const response_code = require("../data/response_code");

module.exports = async (req, res, next) => {

    req.createResponse = createResponse;
    req.resolve = resolveRequest(req, res)
    req.code = response_code

    next()
}
