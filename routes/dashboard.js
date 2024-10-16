// esg-system/routes/dashboard.js

const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const auth = require('../middleware/auth'); // Middleware de autenticação

// Rota protegida para buscar dados mensais agregados de metas filtrados por empresa
router.get('/mensal', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

    const query = `
      SELECT 
        SUM(janeiro) as janeiro, 
        SUM(fevereiro) as fevereiro,
        SUM(marco) as marco,
        SUM(abril) as abril,
        SUM(maio) as maio,
        SUM(junho) as junho,
        SUM(julho) as julho,
        SUM(agosto) as agosto,
        SUM(setembro) as setembro,
        SUM(outubro) as outubro,
        SUM(novembro) as novembro,
        SUM(dezembro) as dezembro,
        SUM(total) as metaTotal
      FROM metas
      WHERE empresa_id = $1
    `;

    const result = await pool.query(query, [empresaId]); // Filtro por empresa_id
    res.json(result.rows[0]); // Envia o primeiro objeto de resultados que contém todos os totais
  } catch (err) {
    console.error("Failed to fetch monthly dashboard data:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota protegida para buscar dados gerais agregados por categoria, filtrados por empresa
router.get('/general', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'Concluído' THEN 1 END) as concluidos,
        COUNT(CASE WHEN status != 'Concluído' THEN 1 END) as nao_concluidos
      FROM 
        planejamento
      WHERE empresa_id = $1
      GROUP BY 
        eixo
    `;
    const result = await pool.query(query, [empresaId]); // Filtro por empresa_id
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch general dashboard data:", err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota protegida para buscar quantidade de indicadores por eixo
router.get('/quantidades-por-eixo', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id;
    const query = `
      SELECT 
        eixo,
        COUNT(*) as total_eixo
      FROM 
        indicators
      WHERE empresa_id = $1
      GROUP BY 
        eixo
    `;
    const result = await pool.query(query, [empresaId]);
    if (result.rows.length === 0) {
      console.log("No data found for empresa_id:", empresaId);
    } else {
      console.log("Data found:", result.rows);
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch quantity by axis:", err.message);
    res.status(500).send('Erro no servidor');
  }
});


module.exports = router;
