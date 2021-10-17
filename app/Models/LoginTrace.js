const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const LoginTraceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },

    traces: {
        type: Map,
        of: Object,
        required: true,
        default: () => {
            return new Map()
        }
    }

})




module.exports = mongoose.model("LoginTrace", LoginTraceSchema);
