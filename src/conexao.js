const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '654321',
    database: 'catalago_pokemons',
});

module.exports = pool;