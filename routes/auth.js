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

        // Consulta para obter o nome da empresa e o plano usando empresa_id
        const companyResult = await pool.query('SELECT name, plano FROM empresas WHERE id = $1', [user.empresa_id]);
        const company = companyResult.rows[0];
        if (!company) {
            console.log('Empresa não encontrada para o id:', user.empresa_id);
            return res.status(404).json({ msg: 'Empresa não encontrada.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, empresa_id: user.empresa_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful:', { user, company }); // Log the user and company details

        res.json({
            token,
            name: user.name,
            role: user.role,
            empresa_id: user.empresa_id,
            empresa_name: company.name,
            plano: company.plano
        });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ msg: 'Erro no servidor.' });
    }
});

module.exports = router;
