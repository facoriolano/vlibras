import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const VLIBRAS_URL = process.env.VLIBRAS_TRANSLATOR_API_URL;
const VLIBRAS_TOKEN = process.env.VLIBRAS_API_TOKEN;

if (!VLIBRAS_URL) {
  console.warn('ATENÇÃO: VLIBRAS_TRANSLATOR_API_URL não configurada. Configure no .env.');
}

// Endpoint de tradução
app.post('/translate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto inválido' });
    }

    // Exemplo de chamada à API do VLibras (ajuste conforme a interface real do vlibras-translator-api)
    // Supondo um endpoint POST /translate que responde com sequência de sinais/markup
    const apiRes = await fetch(`${VLIBRAS_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(VLIBRAS_TOKEN ? { Authorization: `Bearer ${VLIBRAS_TOKEN}` } : {})
      },
      body: JSON.stringify({ text })
    });

    if (!apiRes.ok) {
      const body = await apiRes.text();
      console.error('Erro VLibras API:', apiRes.status, body);
      return res.status(502).json({ error: 'Falha ao comunicar com VLibras API' });
    }

    const payload = await apiRes.json();

    // Retorne o que o player webjs precisa (ex.: signedSequence, gloss, etc.)
    // Ajuste o mapeamento de acordo com o formato real da resposta.
    return res.json({
      signedSequence: payload.signedSequence || payload.sequence || payload.result || null,
      raw: payload
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
