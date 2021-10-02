const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const LoginTraceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },

    traces: {
        type: Map,
        of: Object,
        required: true
    }

})




module.exports = mongoose.model("LoginTrace", LoginTraceSchema);