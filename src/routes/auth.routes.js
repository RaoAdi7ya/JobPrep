const { Router } = require('express')
const authController = require("../controllers/auth.controllers")

const authRouter = Router()


/***
 * @route POST /api/auth/register
 * @description This route is used to register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController )

/***
 * @route POST /api/auth/login
 * @description This route is used to login a user
 * @access Public
 */
authRouter.post("/login", authController.loginUserController)

module.exports = authRouter