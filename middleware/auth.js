// esg-system/middleware/auth.js

const jwt = require('jsonwebtoken');

// Middleware para proteger rotas
const auth = (req, res, next) => {
    // Obtém o token do cabeçalho Authorization
    const authHeader = req.header('Authorization');
    
    // Verifica se o cabeçalho Authorization foi fornecido
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    // Extrai o token do formato Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === "Bearer") {
        const token = parts[1];

        try {
            // Decodifica o token e anexa os dados do usuário à requisição
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log(req.user);
            next();  // Permite que a requisição continue
        } catch (err) {
            res.status(400).json({ msg: 'Token is not valid' });
        }
    } else {
        return res.status(401).json({ msg: 'Token malformatted' });
    }
};

module.exports = auth;
