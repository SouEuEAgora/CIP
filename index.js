require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} online e pronto!`);
});

// Rota raiz exigida pelo UptimeRobot para manter o bot "Up" (verde)
app.get('/', (req, res) => {
    res.send('O bot de cursos e integração está online e rodando!');
});

// Rota POST que o Website vai chamar para enviar mensagens
app.post('/enviar-mensagem', async (req, res) => {
    const { canalId, titulo, descricao } = req.body;

    if (!canalId || !descricao) {
        return res.status(400).json({ sucesso: false, erro: 'canalId e descricao são obrigatórios.' });
    }

    try {
        const canal = await client.channels.fetch(canalId);
        if (!canal) {
            return res.status(404).json({ sucesso: false, erro: 'Canal do Discord não encontrado.' });
        }

        await canal.send({
            embeds: [{
                color: 0x5865F2,
                title: titulo || '📚 Aviso de Curso',
                description: descricao,
                timestamp: new Date().toISOString()
            }]
        });

        return res.status(200).json({ sucesso: true, mensagem: 'Mensagem enviada com sucesso no Discord!' });
    } catch (error) {
        console.error('Erro ao enviar mensagem via API:', error);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao processar envio.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor HTTP rodando na porta ${port}`);
});

const timeout = setTimeout(() => {
    console.error('FALHA: O Render não conseguiu estabelecer conexão WebSocket com o Discord (possível bloqueio de porta/rede).');
}, 15000);

client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        clearTimeout(timeout);
        console.log(`Bot ${client.user.tag} online e pronto!`);
    })
    .catch(err => {
        clearTimeout(timeout);
        console.error('Erro crítico no login:', err);
    });