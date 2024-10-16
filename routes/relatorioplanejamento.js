// esg-system/routes/relatorioplanejamento.js

const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const auth = require('../middleware/auth');

// Rota protegida para relatório de planejamento filtrado por empresa
router.get('/', auth, async (req, res) => {
  try {
    // Obtenha o empresa_id do usuário autenticado
    const empresaId = req.user.empresa_id;

    const result = await pool.query(`
      SELECT
        status,
        EXTRACT(MONTH FROM prazo) AS mes, 
        COUNT(*) AS quantidade
      FROM
        planejamento
      WHERE
        empresa_id = $1
      GROUP BY
        status, EXTRACT(MONTH FROM prazo)
      ORDER BY
        mes
    `, [empresaId]); // Filtra pelo empresa_id

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch planning report data:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Nova rota para agrupar por eixo, também filtrada por empresa_id
router.get('/por-eixo', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id;

    const result = await pool.query(`
      SELECT
        i.eixo,
        COUNT(*) AS quantidade
      FROM
        indicators i
      JOIN
        planejamento p ON i.nomeindicador = p.indicador
      WHERE
        i.eixo IN ('Ambiental', 'Social', 'Governança') 
        AND p.empresa_id = $1
      GROUP BY
        i.eixo
      ORDER BY
        i.eixo
    `, [empresaId]); // Filtra pelo empresa_id

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch data by eixo:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;