// esg-system/routes/analiseesg.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth'); 

function handleEmptyData(rows, categories) {
  if (rows.length === 0) {
    // Se não houver dados, retorna zero para cada categoria
    return categories.map(categoria => ({
      categoria,
      porcentagem_sim: 0
    }));
  }
  return rows.map(row => ({
    categoria: row.categoria,
    porcentagem_sim: row.valid_count > 0 ? Math.round((row.sim_count / row.valid_count) * 100) : 0
  }));
}

// Rota para obter dados ambientais
router.get('/meio-ambiente', auth, async (req, res) => {
  const empresa_id = req.user.empresa_id;
  try {
    const query = `
      SELECT categoria,
             COUNT(*) FILTER (WHERE avaliacao = 'Sim') AS sim_count,
             COUNT(*) FILTER (WHERE avaliacao = 'Sim' OR avaliacao = 'Não') AS valid_count
      FROM meioambiente
      WHERE empresa_id = $1 AND categoria IN ('Resíduos', 'Energia', 'Água', 'Natureza', 'Pegada de Carbono')
      GROUP BY categoria;
    `;
    const { rows } = await db.query(query, [empresa_id]);
    const result = handleEmptyData(rows, ['Resíduos', 'Energia', 'Água', 'Natureza', 'Pegada de Carbono']);
    res.json(result);
  } catch (error) {
    console.error('Erro ao obter dados ambientais:', error);
    res.status(500).send('Erro ao obter dados ambientais.');
  }
});

// Rota para obter dados sociais
router.get('/social', auth, async (req, res) => {
  const empresa_id = req.user.empresa_id;
  try {
    const query = `
      SELECT categoria,
             COUNT(*) FILTER (WHERE avaliacao = 'Sim') AS sim_count,
             COUNT(*) FILTER (WHERE avaliacao = 'Sim' OR avaliacao = 'Não') AS valid_count
      FROM social
      WHERE empresa_id = $1 AND categoria IN ('Trabalho', 'Clientes', 'Equipe', 'Comunidade', 'Segurança e Qualidade')
      GROUP BY categoria;
    `;
    const { rows } = await db.query(query, [empresa_id]);
    const result = handleEmptyData(rows, ['Trabalho', 'Clientes', 'Equipe', 'Comunidade', 'Segurança e Qualidade']);
    res.json(result);
  } catch (error) {
    console.error('Erro ao obter dados sociais:', error);
    res.status(500).send('Erro ao obter dados sociais.');
  }
});

// Rota para obter dados de governança
router.get('/governanca', auth, async (req, res) => {
  const empresa_id = req.user.empresa_id;
  try {
    const query = `
      SELECT categoria,
             COUNT(*) FILTER (WHERE avaliacao = 'Sim') AS sim_count,
             COUNT(*) FILTER (WHERE avaliacao = 'Sim' OR avaliacao = 'Não') AS valid_count
      FROM governanca
      WHERE empresa_id = $1 AND categoria IN ('Finanças', 'Ética', 'Diretoria', 'Conduta', 'Relacionamento com o Governo')
      GROUP BY categoria;
    `;
    const { rows } = await db.query(query, [empresa_id]);
    const result = handleEmptyData(rows, ['Finanças', 'Ética', 'Diretoria', 'Conduta', 'Relacionamento com o Governo']);
    res.json(result);
  } catch (error) {
    console.error('Erro ao obter dados de governança:', error);
    res.status(500).send('Erro ao obter dados de governança.');
  }
});

module.exports = router;
