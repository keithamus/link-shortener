import koa from 'koa'
import {post, get} from 'koa-route'
import bodyParser from 'koa-bodyparser'
import {LinksTable, StatsTable} from './models'
import createDebugger  from 'debug'
const debug = createDebugger('app:admin')

const app = new koa()

app.use(get('/', async (ctx, id) => {
  debug('admin index')
  ctx.body = `<!DOCTYPE html><html><head><title></title><body></body></html>`
  ctx.type = 'html'
}))

app.use(get('/:id', async (ctx, id) => {
  ctx.body = `<!DOCTYPE html><html><head><title></title><body></body></html>`
  ctx.type = 'html'
}))

app.use(post('/:id', async (ctx, id) => {
}))

export default app
