// esg-system/routes/abntpr2030.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// Rota para buscar todas as informações de ABNT PR 2030
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM abntpr2030');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar informações ABNT PR 2030:', error);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;

