// Colors
import colors from 'colors'
colors.enable()

// Declare ENV
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

// Express
import express from 'express'
import 'express-async-errors'

// Route List
import { routesInit } from './app/routes/app.router'

// Middlewares
import { appErrorMiddleware } from './app/middlewares/app-error.middleware'

// App Init
const app = express()

// Accept JSON request from user
app.use(express.json())

// Init Routes
routesInit(app)

// Catch any error inside the app
app.use(appErrorMiddleware)

export { app }
