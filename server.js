// esg-system/server.js

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = requires('fs');

dotenv.config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do banco de dados
  ssl: {
    rejectUnauthorized: true, // Verificar se o certificado é confiável
    ca: fs.readFileSync('ca.pem').toString() // Caminho para o certificado
  }
});

app.use(cors());
app.use(express.json());

// Testa conexão com o banco de dados
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar no banco de dados:', err.stack);
  }
  console.log('Conectado ao banco de dados com sucesso.');
  release();
});

// Rotas da aplicação
const authRoutes = require('./routes/auth');
const abntpr2030Routes = require('./routes/abntpr2030');
const indicatorRoutes = require('./routes/indicator');
const metaRoutes = require('./routes/meta');
const resultadoRoutes = require('./routes/resultados');
const planejamentoRoutes = require('./routes/planejamento');
const relatorioGeralRoutes = require('./routes/relatoriogeral');
const relatorioESG = require('./routes/relatorioesg'); 
const relatorioPlanejamento = require('./routes/relatorioplanejamento');  
const dashboardRoutes = require('./routes/dashboard');
const meioambienteRoutes = require('./routes/meioambiente');
const socialRoutes = require('./routes/social');
const governancaRoutes = require('./routes/governanca');
const analiseesgRoutes = require('./routes/analiseesg');
const roadmapRoutes = require('./routes/roadmap');
const relatorioacoesRoutes = require('./routes/relatorioacoes');
const criarempresaRoutes = require('./routes/criarempresa');

// Registra as rotas da API
app.use('/auth', authRoutes);
app.use('/abntpr2030', abntpr2030Routes);
app.use('/indicator', indicatorRoutes);
app.use('/meta', metaRoutes);
app.use('/resultados', resultadoRoutes);
app.use('/planejamento', planejamentoRoutes);
app.use('/relatoriogeral', relatorioGeralRoutes);
app.use('/relatorioesg', relatorioESG);
app.use('/relatorioplanejamento', relatorioPlanejamento);
app.use('/dashboard', dashboardRoutes);
app.use('/meioambiente', meioambienteRoutes);
app.use('/social', socialRoutes);
app.use('/governanca', governancaRoutes);
app.use('/analiseesg', analiseesgRoutes);
app.use('/roadmap', roadmapRoutes);
app.use('/relatorioacoes', relatorioacoesRoutes);
app.use('/criarempresa', criarempresaRoutes);

// Rota adicional para dados de relatório
app.get('/report/data', (req, res) => {
  // Lógica para buscar dados do relatório
  pool.query('SELECT * FROM report_data', (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar dados do relatório' });
    }
    res.status(200).json(results.rows);
  });
});

// Rota raiz para teste
app.get('/', (req, res) => {
  res.send('API running');
});

// Test route
app.get('/test', (req, res) => res.send('Test route reached')); 

// Middleware global de erro
app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err.stack);
  res.status(500).send('Ocorreu um erro no servidor.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

