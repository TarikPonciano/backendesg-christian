// esg-system/routes/indicator.js

const express = require('express');
const auth = require('../middleware/auth');  // Middleware de autenticação
const pool = require('../db');  // Conexão com o banco de dados
const router = express.Router();

// Rota protegida para adicionar um indicador ESG (somente admins)
router.post('/', auth, async (req, res) => {
    const { nomeIndicador, tipo, tema, eixo } = req.body;
    const empresa_id = req.user.empresa_id;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    if (!nomeIndicador || !tipo || !tema || !eixo) { 
        return res.status(400).json({ msg: 'Por favor, forneça todos os campos obrigatórios.' });
    }

    try {
        // Inserção no banco de dados
        await pool.query(
            'INSERT INTO indicators (nomeIndicador, tipo, tema, eixo, empresa_id) VALUES ($1, $2, $3, $4, $5)', 
            [nomeIndicador, tipo, tema, eixo, empresa_id]
        );
        res.status(201).json({ msg: 'Indicador adicionado com sucesso!' });
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Rota protegida para visualização de indicadores de uma empresa específica
router.get('/', auth, async (req, res) => {
    const empresa_id = req.user.empresa_id;

    try {
        const indicators = await pool.query('SELECT * FROM indicators WHERE empresa_id = $1', [empresa_id]);
        res.json(indicators.rows);
    } catch (err) {
        console.error("Error fetching indicators:", err.message);
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Rota protegida para atualizar um indicador ESG
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { nomeIndicador, tipo, tema, eixo } = req.body;
    const empresa_id = req.user.empresa_id;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    if (!nomeIndicador || !tipo || !tema || !eixo) {
        return res.status(400).json({ msg: 'Por favor, forneça todos os campos obrigatórios.' });
    }

    try {
        const result = await pool.query(
            'UPDATE indicators SET nomeIndicador = $1, tipo = $2, tema = $3, eixo = $4 WHERE id = $5 AND empresa_id = $6',
            [nomeIndicador, tipo, tema, eixo, id, empresa_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Indicador não encontrado ou não pertence à sua empresa.' });
        }

        res.json({ msg: 'Indicador atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar indicador:', err.message);
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Rota protegida para excluir um indicador ESG
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    try {
        const result = await pool.query('DELETE FROM indicators WHERE id = $1 AND empresa_id = $2', [id, empresa_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Indicador não encontrado ou não pertence à sua empresa.' });
        }

        res.json({ msg: 'Indicador excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir indicador:', err.message);
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

module.exports = router;