const nodemailer = require("nodemailer");

module.exports = async (data = {}) => {

    // create reusable transporter object using the default SMTP transport
    let transporterOptions = {
        host: env("NODEMAILER_host"),
        port: env("NODEMAILER_port") || 465,
        secure: env("NODEMAILER_secure") || true,
        auth: {
            user: env("NODEMAILER_user"),
            pass: env("NODEMAILER_password"),
        }
    }

    let testAccount = null;

    if (env("NODEMAILER_testAccount")) {
        testAccount = await nodemailer.createTestAccount();
        transporterOptions = {
            ...transporterOptions,
            ...testAccount.smtp
        };
        transporterOptions.auth = {
            user: testAccount.user,
            pass: testAccount.pass
        }
    }

    let transporter = nodemailer.createTransport(transporterOptions);

    let mailOptions = {
        from: transporterOptions.auth.user,
        ...data
    }

    if (env("NODEMAILER_testAccount")) {
        mailOptions.from = testAccount.user;
    }

    let info = null;

    try {
        info = await transporter.sendMail(mailOptions);
    } catch (e) {
        console.log(e)
        return {
            status: "error",
            message: "Failed to send Mail",
            e: e
        }
    }

    if (info.response.indexOf("OK") > -1 && env("SERVER_MODE") == "dev") {
        log(`Email Sent to {${mailOptions.to}}`, "success", "[MAILER]")
    }

    return {
        status: "success",
        info
    };
}