// esg-system/routes/criarempresa.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// A rota deve estar capturando POST em '/', já que você registra como '/criarempresa' no server.js
router.post('/', async (req, res) => {
    const { email, password, role, name, empresa_name, plano } = req.body;
    console.log("Dados recebidos:", req.body); // Logar os dados recebidos para debug

    if (!email || !password || !role || !name || !empresa_name || !plano) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const companyResult = await pool.query(
        'INSERT INTO empresas (name, plano) VALUES ($1, $2) RETURNING id',
        [empresa_name, plano]
      );
      const empresa_id = companyResult.rows[0].id;
  
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
        const result = await pool.query(`
            SELECT u.id, u.email, u.role, u.name, e.name as empresa_name, e.plano
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
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

// Rota para atualizar um usuário
router.put('/updateUsuario/:userId', async (req, res) => {
    const { userId } = req.params;
    const { email, role, name, empresa_name, plano } = req.body;

    try {
        // Atualizando o usuário
        const updateUserQuery = 'UPDATE usuarios SET email = $1, role = $2, name = $3 WHERE id = $4 RETURNING empresa_id';
        const userResult = await pool.query(updateUserQuery, [email, role.toLowerCase(), name, userId]);
        const empresaId = userResult.rows[0].empresa_id;

        // Verifica se empresaId foi recuperado corretamente
        if (!empresaId) {
            throw new Error('Empresa não encontrada para este usuário');
        }

        // Atualizando a empresa associada, se necessário
        if (empresa_name && plano) {
            const updateCompanyQuery = 'UPDATE empresas SET name = $1, plano = $2 WHERE id = $3';
            await pool.query(updateCompanyQuery, [empresa_name, plano, empresaId]);
        }
        
        res.json({ message: 'Usuário e empresa atualizados com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    }
});

// Rota para deletar um usuário e sua empresa associada
router.delete('/usuarios/:userId', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
});

module.exports = router;
