// esg-system/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ msg: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Credenciais inválidas.' });
        }

        // Consulta para obter o nome da empresa usando empresa_id
        const companyResult = await pool.query('SELECT name FROM empresas WHERE id = $1', [user.empresa_id]);
        const companyName = companyResult.rows[0] ? companyResult.rows[0].name : 'Empresa não encontrada';

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, empresa_id: user.empresa_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            name: user.name,
            role: user.role,
            empresa_id: user.empresa_id,
            empresa_name: companyName // Inclui o nome da empresa na resposta
        });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ msg: 'Erro no servidor.' });
    }
});

module.exports = router;
