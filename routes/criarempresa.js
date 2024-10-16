// esg-system/routes/criarempresa.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// A rota deve estar capturando POST em '/', já que você registra como '/criarempresa' no server.js
router.post('/', async (req, res) => {
    const { email, password, role, name, empresa_name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insere primeiro uma nova empresa
        const companyResult = await pool.query(
            'INSERT INTO empresas (name) VALUES ($1) RETURNING id',
            [empresa_name]
        );
        const empresa_id = companyResult.rows[0].id;

        // Insere o usuário associado a essa empresa
        await pool.query(
            'INSERT INTO usuarios (email, password_hash, role, name, empresa_id) VALUES ($1, $2, $3, $4, $5)',
            [email, hashedPassword, role.toLowerCase(), name, empresa_id]
        );
        res.status(201).json({ message: "Empresa e usuário criados com sucesso!" });
    } catch (error) {
        console.error('Erro ao criar empresa e usuário:', error);
        res.status(500).json({ message: "Erro ao criar empresa e usuário", error: error.message });
    }
});

// Rota para obter todas as empresas
router.get('/empresas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM empresas');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        res.status(500).json({ message: 'Erro ao buscar empresas' });
    }
});

// Rota para obter todos os usuários
router.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});


module.exports = router;

// Rota para atualizar as permissões de uma empresa
router.put('/empresas/:empresaId/permissoes', async (req, res) => {
    const { empresaId } = req.params;
    const { permissoes } = req.body;

    try {
        const empresaResult = await pool.query('SELECT * FROM empresas WHERE id = $1', [empresaId]);
        if (empresaResult.rows.length === 0) {
            return res.status(404).json({ message: 'Empresa não encontrada' });
        }

        await pool.query(
            'UPDATE empresas SET permissoes = $1 WHERE id = $2',
            [JSON.stringify(permissoes), empresaId]
        );
        res.status(200).json({ message: 'Permissões atualizadas com sucesso' });
        console.log("Permissões atualizadas para empresa:", empresaId);
    } catch (error) {
        console.error('Erro ao atualizar permissões da empresa:', error);
        res.status(500).json({ message: 'Erro ao atualizar permissões da empresa', error: error.message });
    }
});

router.get('/empresas/:empresaId/permissoes', async (req, res) => {
    const { empresaId } = req.params;
    try {
        const result = await pool.query('SELECT permissoes FROM empresas WHERE id = $1', [empresaId]);
        if (result.rows.length > 0) {
            res.json({ permissoes: result.rows[0].permissoes });
        } else {
            res.status(404).json({ message: 'Empresa não encontrada' });
        }
    } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
