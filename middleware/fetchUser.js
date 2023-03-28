const jwt = require('jsonwebtoken')
const Jwt_token = "youareasafe";

const fetchUser = (req, res, next) => {
    // get user details from the jwt token and id to req object
    const token = req.header('auth-token')
    if (!token) {
        return res.status(401).send("Access Denied")
    }

    try {
        const data = jwt.verify(token, Jwt_token)
        req.user = data.user
        next()

    } catch (error) {
        return res.status(401).send("Access Denied")
    }
}


module.exports = fetchUser;