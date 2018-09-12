import koa from 'koa'
import bodyParser from 'koa-bodyparser'
import {post} from 'koa-route'
import createDebug from 'debug'
const debug = createDebug('app:auth')

export const authMiddleware = ({token}) => async (ctx, next) => {
  if (ctx.session.token === token) {
    ctx.session.loggedIn = true
    debug('user logged in')
  } else {
    ctx.session.loggedIn = false
    debug('user logged out')
  }
  return next()
}

export const redirectWithoutAuth = (fn, {path = '/'} = {}) => async (ctx, next) => {
  if (ctx.session.loggedIn === false) return ctx.redirect(path)
  return fn(ctx, next)
}

const app = new koa()

app.use(bodyParser())

app.use(post('/login', async (ctx, id) => {
  ctx.session.token = ctx.request.body.token
  debug('user attempted to login, redirecting')
  ctx.redirect('/')
}))

export const authRoute = app
