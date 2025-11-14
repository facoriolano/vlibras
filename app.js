// Configuração
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendToVlibrasBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptEl = document.getElementById('transcript');
const langSelect = document.getElementById('langSelect');

let recognition = null;
let isListening = false;
let fullTranscript = '';

// Inicializa Web Speech API
function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge no PC ou Android.');
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
    console.error('Erro no reconhecimento:', e.error);
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

// Envia texto para VLibras via área de transferência
sendBtn.addEventListener('click', () => {
  const text = transcriptEl.textContent.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    alert('Texto copiado! Agora clique no botão azul do VLibras no canto da tela e cole o texto lá para ver o avatar sinalizar.');
  }).catch(() => {
    alert('Não foi possível copiar o texto. Copie manualmente e cole no VLibras.');
  });
});
