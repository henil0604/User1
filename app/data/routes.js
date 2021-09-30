module.exports = [
    {
        path: "/",
        method: "GET",
        type: "hitpoint",
        middlewares: [
            async (req, res) => {
                res.send("Hello World")
            }
        ]
    },
    {
        path: "/api",
        type: "router",
        routes: require("./api.routes.js")
    },
    {
        type: "middleware",
        middlewares: [
            imp("app/helpers/responseHandler")
        ]
    }
]