const bcrypt = require('bcrypt');
const pool = require('../conexao');
const jwt = require('jsonwebtoken');
const senhaJWT = require('../senhaJWT');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(404).json({ mensagem: 'Preencha todos os dados.' });
    }

    try {
        const verificarEmail = await pool.query('select * from usuarios where email = $1', [email]);

        if (verificarEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Email já existe.' });
        }

        const senhaCrypt = await bcrypt.hash(senha, 10);

        const query = 'insert into usuarios (nome, email, senha) values ($1,$2,$3) returning *'

        const { rows } = await pool.query(query, [nome, email, senhaCrypt]);

        const { senha: _, ...usuario } = rows[0];

        return res.status(201).json(usuario);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json({ mensagem: 'Preencha o email.' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'Preencha a senha.' });
    }

    try {
        const { rows, rowCount } = await pool.query(
            'select * from usuarios where email = $1',
            [email]
        );

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Email ou senha inválida.' });
        }

        const { senha: senhaUsuario, ...usuario } = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, senhaUsuario);

        if (!senhaCorreta) {
            return res.status(400).json({ mensagem: 'Email ou senha inválida' });
        }

        const token = jwt.sign({ id: usuario.id }, senhaJWT, { expiresIn: '8h' });

        return res.json({
            usuario,
            token
        });

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}

module.exports = {
    cadastrarUsuario,
    login
}