const express = require("express");
const router = express.Router();
const User = require("../model/Users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const Jwt_token = "youareasafe";
const jwt = require("jsonwebtoken");
const fetchUser = require('../middleware/fetchUser')

// create a user  using post menthod doesnot require auth end point /api/auth/createUser no login required
router.post(
    "/createUser",
    [
        //validation for create new user
        body("name").isLength({ min: 3 }),
        body("email").isEmail(),
        body("password").isLength({ min: 3 }),
    ],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).send({ error: error.array() });
        }
        let user = await User.findOne({ email: req.body.email });

        try {
            if (user) {
                return res.status(400).json({
                    error: "you are already register please go to login",
                });
            }
            let salt = bcrypt.genSaltSync(10);

            let securePass = await bcrypt.hash(req.body.password, salt);

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: securePass,
            });
            user.save();
            const data = {
                user: {
                    id: user.id,
                },
            };

            const authToken = jwt.sign(data, Jwt_token);
            console.log(authToken);
            res.json({ authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("some things occoured wrongs");
        }
    }
);
// create a user  using post menthod doesnot require auth end point /api/auth/createUser no login required
router.post(
    "/login",
    [
        body("email", "Enter a valid Email").isEmail(),
        body("password", "Enter a valid password").exists(),
    ],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(500).json({ error: error.array() });
        }
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(500)
                    .json({ error: "Please login with Right crendtial" });
            }
            const passwordComare = await bcrypt.compare(password, user.password);
            if (!passwordComare) {
                return res
                    .status(500)
                    .json({ error: "Please login with Right crendtial" });
            }
            const data = {
                user: { id: user.id }
            }
            const authToken = jwt.sign(data, Jwt_token)
            res.send({ authToken })
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Enternal server error");
        }
    }
);

// Route 3 get login user Details:requied authToken  using post request
router.post("/getuser", fetchUser, async (req, res) => {

    try {
        const userId = req.user.id
        console.log(userId)
        const user = await User.findById(userId).select("-password")
        res.send(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Enternal server error");
    }
})
module.exports = router;
