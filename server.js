// esg-system/server.js

const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do banco de dados
  ssl: {
    rejectUnauthorized: false, // Verificar se o certificado é confiável
    ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUVAPX5k9ubXpZn2ITBDkb2FRaPaAwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZWYxNjc2ZGMtZjMwMi00MmY4LThhNDktNmQ1Y2U2YzJl
OTNhIFByb2plY3QgQ0EwHhcNMjQwOTI1MTIyMjA5WhcNMzQwOTIzMTIyMjA5WjA6
MTgwNgYDVQQDDC9lZjE2NzZkYy1mMzAyLTQyZjgtOGE0OS02ZDVjZTZjMmU5M2Eg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKq78bu3
ANMWgF7aSJxGf52xcTUZQ/C29kG4AWnzal51+mca4cL7r4dldWtryRywJdDFaYbo
CC88mNyWLv2th9dBHWeWm9dqQTyoQKnRe6gf9/xq3bX6jW+sJOMSVHL0QiOzk9Dp
yX51aPJaaHYr26AvoaFEy9eYbBwpgC3Pc0uuFI5Lc208h7SUFNNLqcAnhBOYoYcL
L6fxVngD5LlDIrtpKthv7XoAvyRshGXdWpAdJFDU46UZBqiNQepd4OQPKFQH1Idd
K+BlG3wazCn+d+P6j2WT0/gMEfrXXCeYzvY8TxO8M/V0aHZdPRugBIwwtyqjIdg2
uJpb89pFsXPPRHn1WpMSWRAu3r31cisFpWvv4em12DUjQKGm4XVibgqWk4U1cGJf
tzM/LVzfLKwg4460DFKiqXUlwdK/U6rywt/mn19A0pCiu1pxeuTHqHH6US78Jcuh
9pk3jnXQlAyDP3zhDm94HjKjgkzblU2M7sXqpf/qzG1V4qOalw7iaQaxVwIDAQAB
oz8wPTAdBgNVHQ4EFgQUorXgwruZL1vx4t0rLc/ftLeLwIEwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAFdCFF0JpsGmMjEe
r1H5jlo0amVQQ0XQQQxd6XO+MZwuLj3rtUjyf3xRvcvqpn+gcW2wSROCyMjIk626
+BUIfRTXWaWdc6PTrBgMc9x5my9aXKEH2Y1cHnAy9tkhIhQVXTvRx7xP8XHUhHaZ
GQuFW1jpPq/WbrcOZSqE4HdK0Nz313yp9mFRTXZjzg65sfdlbnN4+hPLGC4MqPO2
fBUJzEd7LX5fFBvNVksyPxM2qCh3vH4lZlZFtNtlJ0WY1kfAWeAJ6s7PbbOL1i9a
7eVqqM7bdN/sCajRAR8FnOtxtAhrU/STJ+0SCthPwXocJ0u+laGearPTs7F67Pu9
cUy64mXR4KAgDYqdvijTc2Gmyrusobl2YAjZedu4B1Gn3Pylj+QcJNeg8fJHT2OK
suc53S4O6Wgg6tq67wJ0NTvdD9z3ilnWlqeINTtJ1BlFgfbVcEnlpOhaXGv//+RH
JCfFhJUo/cZYOg8HmJQ8WwCy27USf9/H0XWU2yYDtsTFD5FZ2A==
-----END CERTIFICATE-----
` // Caminho para o certificado
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

