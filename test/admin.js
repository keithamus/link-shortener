import linksApp from '../links'
import { LinksTable, StatsTable } from '../models'
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import { describe, it, beforeEach } from 'mocha'
chai.use(chaiHttp)
const { request } = chai

describe('links app', () => {
  let app
  let id = 0
  beforeEach(() => {
    id++
    linksApp.context.database = `memory://${id}`
    linksApp.context.authToken = 'foobar'
    app = request(linksApp.callback())
  })

  describe('POST /', () => {
    it('accepts url encoded `url` field', async () => {
      const response = await app
        .post('/')
        .redirects(0)
        .type('form')
        .send({ url: 'https://example.com' })
      expect(response)
        .to.have.status(302)
        .and.have.header('location')
    })

    it('accepts and returns json encoded `url` field', async () => {
      const response = await app
        .post('/')
        .redirects(0)
        .type('json')
        .accept('json')
        .send({ url: 'https://example.com' })
      expect(response)
        .to.have.status(302)
        .and.have.header('location')
        .and.have.property('body')
        .with.keys(['created', 'id', 'url'])
        .and.property('url', 'https://example.com')
    })

    it('accepts plain text encoded `url` field', async () => {
      const response = await app
        .post('/')
        .redirects(0)
        .type('text')
        .accept('text')
        .send('https://example.com')
      expect(response)
        .to.have.status(302)
        .and.have.header('location')
        .and.have.property('text')
        .that.contains('Redirecting to')
    })

    it('returns html if asked for it', async () => {
      const response = await app
        .post('/')
        .redirects(0)
        .type('form')
        .accept('html')
        .send({ url: 'https://example.com' })
      expect(response)
        .to.have.status(302)
        .and.have.header('location')
        .and.have.property('text')
        .that.contains('<!DOCTYPE html>')
    })
  })

  describe('POST /:id', () => {
    it('accepts url encoded `url` field', async () => {
      const response = await app
        .post('/aa')
        .redirects(0)
        .type('form')
        .send({ url: 'https://example.com' })
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'aa')
    })

    it('accepts and returns json encoded `url` field', async () => {
      const response = await app
        .post('/aa')
        .redirects(0)
        .type('json')
        .accept('json')
        .send({ url: 'https://example.com' })
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'aa')
        .and.have.property('body')
        .with.keys(['created', 'id', 'url'])
        .and.property('url', 'https://example.com')
    })

    it('accepts plain text encoded `url` field', async () => {
      const response = await app
        .post('/aa')
        .redirects(0)
        .type('text')
        .accept('text')
        .send('https://example.com')
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'aa')
        .and.have.property('text')
        .that.contains('Redirecting to')
    })

    it('conflicts if giving the same url twice', async () => {
      app.keepOpen()
      let response = await app
        .post('/aa')
        .redirects(0)
        .type('json')
        .accept('json')
        .send({ url: 'https://example.com' })
      const created = response.body.created
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'aa')
      response = await app
        .post('/aa')
        .redirects(0)
        .type('form')
        .accept('json')
        .send({ url: 'https://example.com' })
      expect(response)
        .to.have.status(409)
        .and.have.header('location', 'aa')
        .and.have.property('body')
        .deep.equal({ url: 'https://example.com', id: 'aa', created })
    })
  })

  describe('GET /:id', () => {
    it('redirects to given url if in the database', async () => {
      const links = new LinksTable(`memory://${id}`)
      await links.add({ id: 'a', url: 'https://example.com' })
      const response = await app.get('/a').redirects(0)
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'https://example.com')
    })

    it('returns html if asked for it', async () => {
      const links = new LinksTable(`memory://${id}`)
      await links.add({ id: 'a', url: 'https://example.com' })
      const response = await app
        .get('/a')
        .redirects(0)
        .accept('html')
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'https://example.com')
        .and.have.property('text')
        .that.contains('<!DOCTYPE html>')
        .and.contains('<a href="https://example.com">moved here</a>')
    })

    it('returns json if asked for it', async () => {
      const links = new LinksTable(`memory://${id}`)
      await links.add({ id: 'a', url: 'https://example.com' })
      const response = await app
        .get('/a')
        .redirects(0)
        .accept('json')
      expect(response)
        .to.have.status(302)
        .and.have.header('location', 'https://example.com')
        .and.have.property('body')
        .with.keys(['created', 'id', 'url'])
        .and.property('url', 'https://example.com')
    })

    it('404s if given a link that does not exist', async () => {
      const response = await app
        .get('/a')
        .redirects(0)
      expect(response).to.have.status(404)
    })
  })
})
