import koa from 'koa'
import { StatsTable } from './models'
import { randomBytes } from 'crypto'

export default () => async (ctx, next) => {
  await next()
  let id = '<anon>'
  if (ctx.headers['dnt'] !== '1') {
    id = ctx.cookies.get('i')
    if (!id) ctx.cookies.set('i', randomBytes(4).toString('hex'), { overwrite: true })
  }
  const stats = new StatsTable(ctx.database)
  stats
    .add({ page: ctx.url, status: ctx.status, clientId: ctx.session.id, agent: ctx.headers['user-agent'], ip: ctx.ip })
    .catch(e => console.log('Could not add stats', e))
}
