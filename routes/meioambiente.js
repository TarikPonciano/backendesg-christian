// esg-system/routes/meioambiente.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');  // Incluir o middleware de autenticação

// Cria um novo registro de meio ambiente
router.post('/:id?', auth, async (req, res) => {
  const { id } = req.params;
  const { categoria, pergunta, avaliacao, oquefazer } = req.body;
  const empresa_id = req.user.empresa_id;

  if (empresa_id !== req.user.empresa_id) {
    return res.status(403).send('Acesso negado. Você só pode modificar dados da sua própria empresa.');
  }

  try {
    let result;
    if (id) {
      result = await db.query(
        `UPDATE meioambiente SET categoria = $1, pergunta = $2, avaliacao = $3, oquefazer = $4
         WHERE id = $5 AND empresa_id = $6
         RETURNING *`,
        [categoria, pergunta, avaliacao, oquefazer, id, empresa_id]
      );
      if (result.rows.length === 0) {
        // Se nenhum registro foi atualizado, insira um novo
        result = await db.query(
          `INSERT INTO meioambiente (categoria, pergunta, avaliacao, oquefazer, empresa_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [categoria, pergunta, avaliacao, oquefazer, empresa_id]
        );
      }
    } else {
      // Se nenhum ID foi fornecido, insira um novo registro
      result = await db.query(
        `INSERT INTO meioambiente (categoria, pergunta, avaliacao, oquefazer, empresa_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [categoria, pergunta, avaliacao, oquefazer, empresa_id]
      );
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating/inserting governance data:", error);
    res.status(500).send(error.message);
  }
});

// Obtém todos os registros de meio ambiente da empresa do usuário, incluindo detalhes específicos da empresa
router.get('/', auth, async (req, res) => {
  const empresa_id = req.user.empresa_id;
  try {
    const result = await db.query(
      `SELECT id, categoria, pergunta, avaliacao, oquefazer
      FROM meioambiente
      WHERE empresa_id = $1`,
      [empresa_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  }
});

// Obtém uma lista geral de todas as categorias e perguntas, independentemente da empresa
router.get('/general', async (req, res) => {
  try {
    const result = await db.query('SELECT id, categoria, pergunta FROM meioambiente');
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching general category data:", error);
    res.status(500).send(error.message);
  }
});

// Atualiza um registro específico de meio ambiente, garantindo que pertence à empresa do usuário
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { categoria, pergunta, avaliacao, oquefazer, empresa_id } = req.body;

  // Verifica se o empresa_id corresponde ao do usuário autenticado
  if (parseInt(empresa_id, 10) !== req.user.empresa_id) {
      return res.status(403).send('Acesso negado. Você só pode alterar dados da sua própria empresa.');
  }

  // Lógica de atualização
  try {
      const result = await db.query(
          `UPDATE meioambiente SET categoria = $1, pergunta = $2, avaliacao = $3, oquefazer = $4
           WHERE id = $5 AND empresa_id = $6
           RETURNING *`,
          [categoria, pergunta, avaliacao, oquefazer, id, empresa_id]
      );

      if (result.rows.length > 0) {
          res.json(result.rows[0]);
      } else {
          res.status(404).send(`Meio Ambiente com ID ${id} e empresa_id ${empresa_id} não encontrada.`);
      }
  } catch (error) {
      console.error("Error updating data:", error);
      res.status(500).send(error.message);
  }
});

// Rota para deletar todos os registros de meio ambiente de uma empresa específica
router.delete('/all/:empresaId', auth, async (req, res) => {
  const { empresaId } = req.params;
  if (parseInt(empresaId, 10) !== req.user.empresa_id) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode deletar dados da sua própria empresa.' });
  }
  try {
      const result = await db.query(
          'DELETE FROM meioambiente WHERE empresa_id = $1',
          [empresaId]
      );
      if (result.rowCount > 0) {
          res.status(200).json({ message: 'Todos os dados de meio ambiente foram deletados.' });
      } else {
          res.status(404).json({ message: 'Nenhum dado de meio ambiente encontrado para deletar.' });
      }
  } catch (error) {
      console.error("Erro ao deletar todos os dados de meio ambiente:", error);
      res.status(500).json({ message: 'Erro ao deletar todos os dados de meioambiente', error: error.message });
  }
});

module.exports = router;
