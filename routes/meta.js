// esg-system/routes/meta.js

const express = require('express');
const pool = require('../db');
const router = express.Router();
const auth = require('../middleware/auth');

// Função auxiliar para validar a entrada de dados da meta
const validateMeta = (meta) => {
    const { indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total } = meta;
    return indicador && typeof indicador === 'string' &&
           tipo && typeof tipo === 'string' &&
           [janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total]
           .every(month => typeof month === 'number');
};

// Função para adicionar uma meta sem formatação
router.post('/', auth, async (req, res) => {
    const meta = req.body;

    if (!validateMeta(meta)) {
        return res.status(400).json({ msg: 'Dados inválidos. Certifique-se de que todos os campos estão corretos e preenchidos.' });
    }

    const { indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total } = meta;

    try {
        const result = await pool.query(
            'INSERT INTO metas (indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total, empresa_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
            [indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total, req.user.empresa_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao inserir meta no banco de dados:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Função para formatar valores de acordo com o tipo
const formatValueByType = (value, type) => {
    if (type === 'Percentual') {
        return `${parseFloat(value).toFixed(2)}%`;  // Formata como porcentagem
    } else if (type === 'Número') {
        return parseFloat(value).toFixed(1).replace('.', ','); // Formata como número decimal
    } else if (type === 'Moeda') {
        return `R$${parseFloat(value).toFixed(2)}`;  // Formata como moeda
    } else {
        return value;  // Retorna o valor sem formatação se o tipo for diferente
    }
};


// Rota para buscar todas as metas
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM metas WHERE empresa_id = $1', [req.user.empresa_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar metas:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Rota para atualizar uma meta existente
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total } = req.body;

    if (!validateMeta(req.body)) {
        return res.status(400).json({ msg: 'Dados inválidos. Certifique-se de que todos os campos estão corretos e preenchidos.' });
    }

    try {
        const result = await pool.query(
            'UPDATE metas SET indicador = $1, tipo = $2, janeiro = $3, fevereiro = $4, marco = $5, abril = $6, maio = $7, junho = $8, julho = $9, agosto = $10, setembro = $11, outubro = $12, novembro = $13, dezembro = $14, total = $15 WHERE id = $16 AND empresa_id = $17 RETURNING *',
            [indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total, id, req.user.empresa_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar meta no banco de dados:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Rota para excluir uma meta específica
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM metas WHERE id = $1 AND empresa_id = $2 RETURNING *', [id, req.user.empresa_id]);
        if (result.rows.length > 0) {
            res.json({ msg: 'Meta deletada com sucesso.' });
        } else {
            res.status(404).json({ msg: 'Meta não encontrada.' });
        }
    } catch (err) {
        console.error('Erro ao deletar meta:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

module.exports = router;
