// Importando os módulos necessários
const express = require('express');
const axios = require('axios');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

// Criando uma instância do Express
const app = express();
const PORT = 3000;

app.use(cookieParser());

// Middleware para análise de dados codificados na URL
app.use(express.urlencoded({ extended: true }));

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost', // Endereço do servidor MySQL
    user: 'root', // Nome de usuário do MySQL
    password: 'root', // Senha do MySQL
    database: 'idev2' // Nome do banco de dados
});



// Conectando-se ao banco de dados MySQL
connection.connect((err) => {
    console.log("Conectando com banco de dados...");
    if (err) {
        console.error('Erro ao conectar-se ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados MySQL');
});

// Middleware de autenticação
const authenticate = (req, res, next) => {
    if (req.cookies && req.cookies.authenticated) {
        // Se o cookie de autenticação estiver presente, o usuário está autenticado
        next();
    } else {
        // Se não estiver autenticado, redirecione para a página de login
        res.redirect('/login');
    }
};

// Servindo arquivos estáticos na pasta 'public'
app.use(express.static('public'));

// Rota para a página de home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
    res.clearCookie('authenticated');
});

// Rota para a página de login
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
    res.clearCookie('authenticated');
});

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/cadastro.html');
    res.clearCookie('authenticated');
});

// Rota para servir o arquivo viacep.js
app.get('/viacep.js', (req, res) => {
    res.sendFile(__dirname + '/viacep.js');
});

//Rota para a página de autentificação
app.get('/ambienteseguro', authenticate, (req, res) => {
    res.sendFile(__dirname + '/ambienteseguro.html');
});

// Rota de logout
app.get('/sair', (req, res) => {
    // Remover cookie de autenticação
    res.clearCookie('authenticated');
    res.redirect('/login');
});

// Rota para lidar com o cadastro de usuários
app.post('/cadastro', async (req, res) => {
    let { nome, email, senha, cep, rua, estado, cidade, numero } = req.body;

    // Remover o hífen do CEP, se presente
    cep = cep.replace(/-/g, '');

    // Hash da senha usando bcrypt
    const hashedPassword = await bcrypt.hash(senha, 10); // O segundo argumento é o custo do hash

    // Inserir novo usuário no banco de dados
    connection.query('INSERT INTO usuarios (nome, email, senha, cep, rua, estado, cidade, numero) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, email, hashedPassword, cep, rua, estado, cidade, numero],
        (err, results) => {
            if (err) {
                console.error('Erro ao inserir usuário:', err);
                return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
            }
            console.log('Novo usuário inserido com sucesso:', results.insertId);
            res.status(200).json({ message: 'Usuário cadastrado com sucesso!' });
        });

});

// Rota para processar o login do usuário
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    // Consulta SQL para verificar se o usuário existe no banco de dados
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: 'Erro ao processar o login' });
        }

        // Verificar se o usuário existe
        if (results.length === 0) {
            return res.status(200).send('E-mail ou senha incorretos');
        }

        // Comparar a senha fornecida com a senha armazenada no banco de dados
        const usuario = results[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(200).send('E-mail ou senha incorretos');
        }
        
        // Definir cookie de autenticação
        res.cookie('authenticated', true);
        res.redirect('/ambienteseguro');
    });

});


// Iniciando o servidor na porta especificada
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Adicionando um manipulador para o evento 'exit' do processo
process.on('exit', () => {
    console.log('Encerrando servidor...');

    // Encerrando a conexão com o banco de dados
    connection.end((err) => {
        if (err) {
            console.error('Erro ao encerrar conexão com banco de dados:', err);
            return;
        }
        console.log('Conexão com banco de dados encerrada.');
    });
});






