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
    },
    {
        path: "/profile",
        method: "POST",
        type: "hitpoint",
        middlewares: [
            imp("app/middlewares/isAuthenticated"),
            imp("app/routes/api/profile")
        ]
    },
    {
        path: "/logout",
        method: "POST",
        type: "hitpoint",
        middlewares: [
            imp("app/middlewares/isAuthenticated"),
            imp("app/routes/api/logout")
        ]
    },
]