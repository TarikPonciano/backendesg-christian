// esg-system/routes/resultados.js

const express = require('express');
const pool = require('../db');
const router = express.Router();
const auth = require('../middleware/auth');

// Função para converter valores formatados em seus valores numéricos brutos
const cleanValue = (value, type) => {
    if (typeof value !== 'string') {
        value = String(value);
    }
    if (type === 'Percentual') {
        return parseFloat(value.replace('%', ''));
    } else if (type === 'Moeda') {
        return parseFloat(value.replace(/[R$ ,]/g, ''));
    } else {
        return parseFloat(value);
    }
};

// Função auxiliar para validar a entrada de dados do resultado
const validateResultado = (resultado) => {
    const { indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total } = resultado;
    return indicador && typeof indicador === 'string' &&
           tipo && typeof tipo === 'string' &&
           [janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total]
           .every(month => !isNaN(cleanValue(month, tipo)));
};

// Rota para adicionar um resultado (autenticado e associado à empresa)
router.post('/', auth, async (req, res) => {
    const { indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total } = req.body;

    if (!validateResultado(req.body)) {
        return res.status(400).json({ msg: 'Dados inválidos. Certifique-se de que todos os campos estão corretos e preenchidos corretamente.' });
    }

    const cleanedData = {
        janeiro: cleanValue(janeiro, tipo), fevereiro: cleanValue(fevereiro, tipo), marco: cleanValue(marco, tipo),
        abril: cleanValue(abril, tipo), maio: cleanValue(maio, tipo), junho: cleanValue(junho, tipo),
        julho: cleanValue(julho, tipo), agosto: cleanValue(agosto, tipo), setembro: cleanValue(setembro, tipo),
        outubro: cleanValue(outubro, tipo), novembro: cleanValue(novembro, tipo), dezembro: cleanValue(dezembro, tipo),
        total: cleanValue(total, tipo)
    };

    try {
        const result = await pool.query(
            'INSERT INTO resultados (indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total, empresa_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
            [indicador, tipo, ...Object.values(cleanedData), req.user.empresa_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao inserir resultado no banco de dados:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Rota para buscar todos os resultados da empresa do usuário autenticado
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resultados WHERE empresa_id = $1', [req.user.empresa_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar resultados:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Rota para atualizar um resultado existente (autenticado e restrito à empresa do usuário)
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { indicador, tipo, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, total } = req.body;

    if (!validateResultado(req.body)) {
        return res.status(400).json({ msg: 'Dados inválidos. Certifique-se de que todos os campos estão corretos e preenchidos.' });
    }

    const cleanedData = {
        janeiro: cleanValue(janeiro, tipo), fevereiro: cleanValue(fevereiro, tipo), marco: cleanValue(marco, tipo),
        abril: cleanValue(abril, tipo), maio: cleanValue(maio, tipo), junho: cleanValue(junho, tipo),
        julho: cleanValue(julho, tipo), agosto: cleanValue(agosto, tipo), setembro: cleanValue(setembro, tipo),
        outubro: cleanValue(outubro, tipo), novembro: cleanValue(novembro, tipo), dezembro: cleanValue(dezembro, tipo),
        total: cleanValue(total, tipo)
    };

    try {
        const result = await pool.query(
            'UPDATE resultados SET indicador = $1, tipo = $2, janeiro = $3, fevereiro = $4, marco = $5, abril = $6, maio = $7, junho = $8, julho = $9, agosto = $10, setembro = $11, outubro = $12, novembro = $13, dezembro = $14, total = $15 WHERE id = $16 AND empresa_id = $17 RETURNING *',
            [indicador, tipo, ...Object.values(cleanedData), id, req.user.empresa_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar resultado:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

// Rota para excluir um resultado específico da empresa do usuário (autenticado)
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM resultados WHERE id = $1 AND empresa_id = $2 RETURNING *', [id, req.user.empresa_id]);
        if (result.rows.length > 0) {
            res.json({ msg: 'Resultado deletado com sucesso.' });
        } else {
            res.status(404).json({ msg: 'Resultado não encontrado.' });
        }
    } catch (err) {
        console.error('Erro ao deletar resultado:', err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
});

module.exports = router;
