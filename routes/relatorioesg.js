// esg-system/routes/relatorioesg.js

const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const auth = require('../middleware/auth'); // Middleware de autenticação

// Rota protegida por autenticação para buscar o relatório ESG filtrado pelo empresa_id
router.get('/', auth, async (req, res) => {
  try {
    // Obtém o empresa_id do usuário autenticado a partir do middleware auth
    const empresaId = req.user.empresa_id;

    // Consulta SQL que busca os dados ESG filtrados pelo empresa_id
    const result = await pool.query(`
      SELECT
        ab.temas AS tema,
        ab.eixo AS eixo,
        COALESCE(SUM(m.total), 0) AS metatotal,
        COALESCE(SUM(r.total), 0) AS realizadototal,
        CASE
          WHEN COALESCE(SUM(m.total), 0) > 0 
            THEN ROUND((COALESCE(SUM(r.total), 0)::decimal / SUM(m.total)) * 100, 2)
          ELSE 0
        END AS percentual_medio_conclusao,
        COUNT(DISTINCT p.id) AS acoes_previstas,
        COUNT(DISTINCT CASE WHEN p.status = 'Concluído' THEN p.id END) AS acoes_concluidas,
        CASE
          WHEN COUNT(DISTINCT p.id) > 0 
            THEN ROUND((COUNT(DISTINCT CASE WHEN p.status = 'Concluído' THEN p.id END)::decimal / COUNT(DISTINCT p.id)) * 100, 2)
          ELSE 0
        END AS percentual_acoes
      FROM
        abntpr2030 ab
      LEFT JOIN indicators i ON ab.temas = i.tema AND ab.eixo = i.eixo
      LEFT JOIN metas m ON i.id::text = m.indicador AND m.empresa_id = $1
      LEFT JOIN resultados r ON i.id::text = r.indicador AND r.empresa_id = $1
      LEFT JOIN planejamento p ON i.tema = p.tema AND i.eixo = p.eixo AND p.empresa_id = $1
      WHERE
        (m.empresa_id IS NOT NULL OR r.empresa_id IS NOT NULL OR p.empresa_id IS NOT NULL)
      GROUP BY
        ab.temas, ab.eixo
      ORDER BY
        ab.eixo
    `, [empresaId]); // O filtro é aplicado ao empresa_id do usuário autenticado

    // Envia os dados filtrados como resposta
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch ESG report data:", err);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
