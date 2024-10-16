// esg-system/routes/relatoriogeral.js

const express = require('express');
const pool = require('../db');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware de autenticação

// Rota protegida por autenticação para buscar o relatório geral filtrado pelo empresa_id
router.get('/', auth, async (req, res) => {
  try {
    // Filtra pelo empresa_id do usuário autenticado
    const empresaId = req.user.empresa_id;

    // Log para garantir que o empresaId está correto
    console.log('Empresa ID:', empresaId);

    const result = await pool.query(`
      WITH EixoCounts AS (
        SELECT eixo, COUNT(*) AS total_eixo
        FROM indicators
        WHERE empresa_id = $1
        GROUP BY eixo
      )
      SELECT
        i.nomeindicador AS indicador,
        m.tipo AS tipo,
        i.eixo AS eixo,
        i.tema,
        COALESCE(m.janeiro, 0) AS meta_janeiro,
        COALESCE(m.fevereiro, 0) AS meta_fevereiro,
        COALESCE(m.marco, 0) AS meta_marco,
        COALESCE(m.abril, 0) AS meta_abril,
        COALESCE(m.maio, 0) AS meta_maio,
        COALESCE(m.junho, 0) AS meta_junho,
        COALESCE(m.julho, 0) AS meta_julho,
        COALESCE(m.agosto, 0) AS meta_agosto,
        COALESCE(m.setembro, 0) AS meta_setembro,
        COALESCE(m.outubro, 0) AS meta_outubro,
        COALESCE(m.novembro, 0) AS meta_novembro,
        COALESCE(m.dezembro, 0) AS meta_dezembro,
        COALESCE(m.total, 0) AS metatotal,
        COALESCE(r.janeiro, 0) AS resultado_janeiro,
        COALESCE(r.fevereiro, 0) AS resultado_fevereiro,
        COALESCE(r.marco, 0) AS resultado_marco,
        COALESCE(r.abril, 0) AS resultado_abril,
        COALESCE(r.maio, 0) AS resultado_maio,
        COALESCE(r.junho, 0) AS resultado_junho,
        COALESCE(r.julho, 0) AS resultado_julho,
        COALESCE(r.agosto, 0) AS resultado_agosto,
        COALESCE(r.setembro, 0) AS resultado_setembro,
        COALESCE(r.outubro, 0) AS resultado_outubro,
        COALESCE(r.novembro, 0) AS resultado_novembro,
        COALESCE(r.dezembro, 0) AS resultado_dezembro,
        COALESCE(r.total, 0) AS realizadototal,
        ec.total_eixo,
        CASE
          WHEN COALESCE(m.total, 0) > 0 
          THEN ROUND((COALESCE(r.total, 0)::decimal / m.total) * 100, 2)
          ELSE '0'
        END AS percentual_realizado,
        COALESCE(p.acoes_previstas, 0) AS acoes_previstas,
        COALESCE(p.acoes_concluidas, 0) AS acoes_concluidas,
        CASE
          WHEN COALESCE(p.acoes_previstas, 0) > 0 
          THEN ROUND((COALESCE(p.acoes_concluidas, 0)::decimal / p.acoes_previstas) * 100, 2)
          ELSE '0'
        END AS percentual_acoes
      FROM indicators i
      LEFT JOIN metas m ON i.nomeindicador = m.indicador
      LEFT JOIN resultados r ON i.nomeindicador = r.indicador
      LEFT JOIN (
        SELECT indicador, eixo, COUNT(*) AS acoes_previstas, SUM(CASE WHEN status = 'Concluído' THEN 1 ELSE 0 END) AS acoes_concluidas
        FROM planejamento
        GROUP BY indicador, eixo
      ) p ON i.nomeindicador = p.indicador
      LEFT JOIN EixoCounts ec ON i.eixo = ec.eixo
      WHERE i.empresa_id = $1
      ORDER BY i.eixo, i.nomeindicador
    `, [empresaId]); // Parâmetro empresaId passado aqui

    // Retorna os resultados como JSON
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch general report data:", err);
    res.status(500).send('Erro no servidor');
  }
});

router.get('/qtdporeixo', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id;
    const query = `
      SELECT eixo, COUNT(*) AS total_eixo
      FROM indicators
      WHERE empresa_id = $1
      GROUP BY eixo
    `;
    const result = await pool.query(query, [empresaId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching eixo counts:", err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

