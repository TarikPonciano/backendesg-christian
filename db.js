// esg-system/db.js

const { Pool } = require('pg');
require('dotenv').config();  // Carregar as variáveis de ambiente do arquivo .env

// Criando uma nova instância de pool para conectar ao PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,  // URL do banco de dados que está no arquivo .env
});

// Função que permite realizar queries no banco de dados
module.exports = {
    query: (text, params) => pool.query(text, params),
};

