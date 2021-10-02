module.exports = [
    {
        path: "/",
        method: "GET",
        type: "hitpoint",
        middlewares: [
            async (req, res) => {
                res.send("Hello From /api")
            }
        ]
    },
    {
        path: "/register",
        method: "POST",
        type: "hitpoint",
        middlewares: [
            imp("app/routes/api/register")
        ]
    },
    {
        path: "/login",
        method: "POST",
        type: "hitpoint",
        middlewares: [
            imp("app/routes/api/login")
        ]
    }
]