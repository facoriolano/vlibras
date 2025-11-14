// Elementos da interface
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendToVlibrasBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptEl = document.getElementById('transcript');
const langSelect = document.getElementById('langSelect');

let recognition = null;
let isListening = false;
let fullTranscript = '';

// Inicializa reconhecimento de voz
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

// Botão iniciar
startBtn.addEventListener('click', () => {
  fullTranscript = '';
  transcriptEl.textContent = '';
  recognition.lang = langSelect.value;
  recognition.start();
});

// Botão parar
stopBtn.addEventListener('click', () => {
  if (recognition && isListening) recognition.stop();
});

// Botão limpar
clearBtn.addEventListener('click', () => {
  fullTranscript = '';
  transcriptEl.textContent = '';
  sendBtn.disabled = true;
});

// Botão enviar para VLibras (abre nova janela e copia texto)
sendBtn.addEventListener('click', () => {
  const text = transcriptEl.textContent.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    window.open('avatar.html', '_blank', 'width=800,height=600');
    alert('Texto copiado! A janela do avatar foi aberta. Cole o texto lá para ver a tradução.');
  }).catch(() => {
    alert('Não foi possível copiar o texto. Copie manualmente e cole na janela do avatar.');
  });
});
