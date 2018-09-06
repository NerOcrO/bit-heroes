'use strict'

import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import Debug from 'debug'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import { join } from 'path'
import router from './middlewares/router'

const app = express()
const debug = Debug('bit-heroes')
const port = process.env.PORT || 8080

// Select of view engine.
app.set('view engine', 'ejs')
app.set('view options', { rmWhitespace: true })
// Views directory.
app.set('views', join(__dirname, 'views'))

/**
 * MIDDLEWARES.
 */

// Header protection.
app.use(helmet())
// Compress all responses.
app.use(compression())
// Public directories.
app.use(express.static('src/assets'))
app.use(express.static('data'))
app.use(express.static('public'))
// CSRF
app.use(cookieParser())
// Body parser (POST).
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// Session.
const sess = {
  secret: 'bit-heroes nerocro',
  resave: false,
  saveUninitialized: true,
  cookie: {},
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}
app.use(session(sess))
// Routing.
app.use(csurf({ cookie: true }), router)

// Listening port.
app.listen(port, () => debug(`=> http://localhost:${port} !`))
