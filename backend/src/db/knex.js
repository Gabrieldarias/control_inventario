const knex = require('knex');
const dotenv = require('dotenv');
dotenv.config();

const client = process.env.DB_CLIENT || 'sqlite3';

let config = {
  client
};

if (client === 'sqlite3') {
  config.connection = {
    filename: process.env.DB_FILENAME || './tienda_mvp.db'
  };
  config.useNullAsDefault = true;
} else {
  config.connection = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || (client === 'pg' ? 5432 : 3306),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'tienda_mvp'
  };
}

const db = knex(config);

module.exports = db;

