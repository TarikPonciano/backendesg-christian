// esg-system/routes/roadmap.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth'); // Middleware de autenticação

// Rota para buscar todos os roadmaps filtrados por empresa_id
router.get('/', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

    const result = await db.query('SELECT * FROM roadmaps WHERE empresa_id = $1', [empresaId]); // Filtro por empresa_id
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).send(error.message);
  }
});

// Rota para buscar um roadmap específico por ID, também filtrado por empresa_id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

    const result = await db.query('SELECT * FROM roadmaps WHERE id = $1 AND empresa_id = $2', [id, empresaId]); // Filtro por empresa_id
    if (result.rows.length) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Roadmap not found');
    }
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).send(error.message);
  }
});

// Rota para criar um novo roadmap, associando ao empresa_id do usuário autenticado
router.post('/', auth, async (req, res) => {
  const { plano, categoria, area, data, responsavel, gastoplanejado, gastorealizado, status, observacoes } = req.body;
  const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

  // Verificação de campos obrigatórios
  if (!plano || !categoria || !area || !data || !responsavel || !status) {
    return res.status(400).send('Campos obrigatórios estão faltando.');
  }

  // Conversão e validação dos valores monetários
  let gastoplanejadoFormatted = gastoplanejado ? parseFloat(gastoplanejado.replace(/,/g, '.')) : null;
  let gastorealizadoFormatted = gastorealizado ? parseFloat(gastorealizado.replace(/,/g, '.')) : null;

  if (gastoplanejadoFormatted === null || isNaN(gastoplanejadoFormatted)) {
    return res.status(400).send('Valor de gasto planejado deve ser numérico e não pode ser nulo.');
  }

  if (gastorealizadoFormatted === null || isNaN(gastorealizadoFormatted)) {
    return res.status(400).send('Valor de gasto realizado deve ser numérico e não pode ser nulo.');
  }

  try {
    const result = await db.query(
      'INSERT INTO roadmaps (plano, categoria, area, data, responsavel, gastoplanejado, gastorealizado, status, observacoes, empresa_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [plano, categoria, area, data, responsavel, gastoplanejadoFormatted.toFixed(2), gastorealizadoFormatted.toFixed(2), status, observacoes, empresaId] // Inclui empresa_id na inserção
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating roadmap:", error);
    res.status(500).send('Erro ao criar o roadmap: ' + error.message);
  }
});

// Rota para deletar um roadmap, filtrando por empresa_id
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

  try {
    const result = await db.query('DELETE FROM roadmaps WHERE id = $1 AND empresa_id = $2 RETURNING id', [id, empresaId]); // Filtro por empresa_id
    if (result.rows.length) {
      res.json({ message: 'Roadmap deleted', id: result.rows[0].id });
    } else {
      res.status(404).send('Roadmap not found for deletion');
    }
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).send(error.message);
  }
});

// Rota para atualizar um roadmap existente, filtrando por empresa_id
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { plano, categoria, area, data, responsavel, gastoplanejado, gastorealizado, status, observacoes } = req.body;
  const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

  // Verificação de campos obrigatórios
  if (!plano || !categoria || !area || !data || !responsavel || !status) {
    return res.status(400).send('Campos obrigatórios estão faltando.');
  }

  // Conversão e validação dos valores monetários
  let gastoplanejadoFormatted = gastoplanejado ? parseFloat(gastoplanejado.replace(/,/g, '.')) : null;
  let gastorealizadoFormatted = gastorealizado ? parseFloat(gastorealizado.replace(/,/g, '.')) : null;

  if (gastoplanejadoFormatted === null || isNaN(gastoplanejadoFormatted)) {
    return res.status(400).send('Valor de gasto planejado deve ser numérico e não pode ser nulo.');
  }

  if (gastorealizadoFormatted === null || isNaN(gastorealizadoFormatted)) {
    return res.status(400).send('Valor de gasto realizado deve ser numérico e não pode ser nulo.');
  }

  try {
    const result = await db.query(
      'UPDATE roadmaps SET plano = $1, categoria = $2, area = $3, data = $4, responsavel = $5, gastoplanejado = $6, gastorealizado = $7, status = $8, observacoes = $9 WHERE id = $10 AND empresa_id = $11 RETURNING *',
      [plano, categoria, area, data, responsavel, gastoplanejadoFormatted.toFixed(2), gastorealizadoFormatted.toFixed(2), status, observacoes, id, empresaId] // Inclui empresa_id na atualização
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Roadmap não encontrado.');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar roadmap:", error);
    res.status(500).send('Erro ao atualizar o roadmap: ' + error.message);
  }
});

module.exports = router;
