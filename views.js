import koa from 'koa'
import bodyParser = require('koa-bodyparser')
import debug = require('debug')('link-shortener')
import pg from './models.postgres'
import sqlite from './models.sqlite'
import mem from './models.memory'

const port = process.env.PORT || 3000
const app = express()
