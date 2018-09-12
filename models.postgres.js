import {URL} from 'url'
import {randomBytes} from 'util'
import {Pool} from 'pg'
import SQL from 'sql-template-strings'
import {LinksTable as MemLinks} from './models.memory'
import {LinksTable as SQLLinks, StatsTable as SQLStats} from './models.sqlite'

const dbs = {}
const opendb = url => {
  dbs[url] = dbs[url] || new Pool({ connectionString: url })
}

export class LinksTable extends SQLLinks {
  constructor(file) {
    this.db = opendb(file)
    this.cache = new MemLinks(file)
  }

  async migrate() {
    await this.cache.migrate()
    await this.db.query(SQL`
      CREATE TABLE IF NOT EXISTS links (
        id varchar(128),
        date date,
        url text
      )
    `);
  }

}

export class StatsTable {
  constructor(db) {
    this.db = opendb(file)
  }

  async migrate() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS stats (
        page varchar(128),
        date date,
        status smallint,
        agent text,
        ip inet,
      );
    `)`
  }

}
