// esg-system/routes/planejamento.js

const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../db');
const router = express.Router();

// Rota para buscar planejamento filtrado pelo empresa_id
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM planejamento WHERE empresa_id = $1', [req.user.empresa_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar planejamentos:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Rota para adicionar planejamento com empresa_id
router.post('/', auth, async (req, res) => {
    const { indicador, eixo, tema, responsavel, prazo, status } = req.body;
    const empresaId = req.user.empresa_id;
    try {
        const result = await pool.query(
            'INSERT INTO planejamento (indicador, eixo, tema, responsavel, prazo, status, empresa_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [indicador, eixo, tema, responsavel, prazo, status, empresaId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao adicionar planejamento:', error);
        res.status(500).json({ msg: 'Erro no servidor' });
    }
});

// Rota para atualizar planejamento, restrito à empresa do usuário autenticado
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { indicador, eixo, tema, responsavel, prazo, status } = req.body;
    const empresaId = req.user.empresa_id;
    try {
        const result = await pool.query(
            'UPDATE planejamento SET indicador = $1, eixo = $2, tema = $3, responsavel = $4, prazo = $5, status = $6 WHERE id = $7 AND empresa_id = $8 RETURNING *',
            [indicador, eixo, tema, responsavel, prazo, status, id, empresaId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Planejamento não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar planejamento:', error.message);
        res.status(500).json({ msg: 'Erro no servidor', error: error.message });
    }
});

// Rota para excluir planejamento de uma empresa específica
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const empresaId = req.user.empresa_id;
    try {
        const result = await pool.query('DELETE FROM planejamento WHERE id = $1 AND empresa_id = $2 RETURNING *', [id, empresaId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Planejamento não encontrado' });
        }
        res.json({ msg: 'Planejamento deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar planejamento:', error.message);
        res.status(500).json({ msg: 'Erro no servidor', error: error.message });
    }
});

module.exports = router;
