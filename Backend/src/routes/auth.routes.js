const { Router } = require('express')
const authController = require("../controllers/auth.controllers")
const authMiddleware = require("../middlewares/auth.middleware")
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

/***
 * @route GET /api/auth/logout
 * @description This route is used to logout a user
 * @access Public
 */
authRouter.get("/logout", authController.logoutUserController)

/***
 *@route GET /api/auth/get-me
 *@description get the current logged in user details
 *@access Private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController) 




module.exports = authRouter