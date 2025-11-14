// Configuração
const BACKEND_URL = 'https://SEU_BACKEND_URL/translate'; // ajuste após subir o backend

// Elementos
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendToVlibrasBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptEl = document.getElementById('transcript');
const langSelect = document.getElementById('langSelect');

// Estado
let recognition = null;
let isListening = false;
let fullTranscript = '';

// Inicializa Web Speech API
function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('Seu navegador não suporta Web Speech API. Use Chrome/Edge no desktop ou Android.');
    startBtn.disabled = true;
    return;
  }
  recognition = new SR();
  recognition.lang = langSelect.value;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    sendBtn.disabled = true;
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) {
        fullTranscript += res[0].transcript + ' ';
      } else {
        interim += res[0].transcript;
      }
    }
    transcriptEl.textContent = (fullTranscript + interim).trim();
    sendBtn.disabled = transcriptEl.textContent.length === 0;
  };

  recognition.onerror = (e) => {
    console.error('Reconhecimento erro:', e.error);
  };

  recognition.onend = () => {
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    sendBtn.disabled = transcriptEl.textContent.length === 0;
  };
}

initSpeechRecognition();

startBtn.addEventListener('click', () => {
  if (!recognition) return;
  fullTranscript = '';
  transcriptEl.textContent = '';
  recognition.lang = langSelect.value;
  recognition.start();
});

stopBtn.addEventListener('click', () => {
  if (recognition && isListening) recognition.stop();
});

clearBtn.addEventListener('click', () => {
  fullTranscript = '';
  transcriptEl.textContent = '';
  sendBtn.disabled = true;
});

// Envia texto ao backend para tradução e aciona avatar
sendBtn.addEventListener('click', async () => {
  const text = transcriptEl.textContent.trim();
  if (!text) return;

  sendBtn.disabled = true;
  sendBtn.textContent = 'Traduzindo...';

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error('Falha no backend');
    const data = await res.json();

    // data.signedSequence: sequência/markup retornada pela API de tradução
    // Integração com o player VLibras:
    // Se você usar vlibras-player-webjs, aqui você chamaria o método do player para tocar.
    // Exemplo (placeholder): window.VLibrasPlayer.play(data.signedSequence)

    alert('Texto enviado para VLibras. Se o player estiver configurado, o avatar será acionado.');
  } catch (err) {
    console.error(err);
    alert('Erro ao traduzir. Verifique o backend.');
  } finally {
    sendBtn.textContent = 'Enviar para VLibras';
    sendBtn.disabled = false;
  }
});
