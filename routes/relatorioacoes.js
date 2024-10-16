// esg-system/routes/relatorioacoes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho conforme necessário
const auth = require('../middleware/auth'); // Middleware de autenticação

// Rota para buscar relatórios de ações agregados por categoria e status, filtrado por empresa_id
router.get('/', auth, async (req, res) => {
    try {
        const empresaId = req.user.empresa_id; // Obtém o empresa_id do usuário autenticado

        // Consulta para agrupar e contar o status dos planos por categoria, filtrado por empresa_id
        const result = await db.query(`
            SELECT 
                categoria, 
                COUNT(*) FILTER (WHERE status = 'Não Iniciado') AS nao_iniciado,
                COUNT(*) FILTER (WHERE status = 'Em andamento') AS em_andamento,
                COUNT(*) FILTER (WHERE status = 'Atrasado') AS atrasado,
                COUNT(*) FILTER (WHERE status = 'Concluído') AS concluido,
                SUM(gastoplanejado) AS gasto_planejado,
                SUM(gastorealizado) AS gasto_realizado,
                (SUM(gastorealizado) - SUM(gastoplanejado)) AS diferenca
            FROM roadmaps
            WHERE empresa_id = $1
            GROUP BY categoria
            ORDER BY categoria
        `, [empresaId]); // Filtro por empresa_id

        // Mapeia os resultados para o formato esperado pelo frontend
        const data = result.rows.map(row => ({
            categoria: row.categoria,
            planosDeAcao: parseInt(row.nao_iniciado) + parseInt(row.em_andamento) + parseInt(row.atrasado) + parseInt(row.concluido),
            naoIniciado: parseInt(row.nao_iniciado),
            emAndamento: parseInt(row.em_andamento),
            atrasado: parseInt(row.atrasado),
            concluido: parseInt(row.concluido),
            gastoPlanejado: parseFloat(row.gasto_planejado).toFixed(2),
            gastoRealizado: parseFloat(row.gasto_realizado).toFixed(2),
            diferenca: parseFloat(row.diferenca).toFixed(2)
        }));

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar relatórios de ações:', error);
        res.status(500).send('Erro ao buscar relatórios de ações');
    }
});

module.exports = router;
