const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendToVlibrasBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptEl = document.getElementById('transcript');
const langSelect = document.getElementById('langSelect');
const historyList = document.getElementById('historyList');
const downloadBtn = document.getElementById('downloadHistoryBtn');

let recognition = null;
let isListening = false;
let fullTranscript = '';
let historyData = [];

function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('Seu navegador não suporta reconhecimento de voz. Use Google Chrome ou Microsoft Edge.');
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
  sendBtn.disabled = true;
  recognition.lang = langSelect.value;
  recognition.start();
});

stopBtn.addEventListener('click', () => {
  if (recognition && isListening) recognition.stop();
});

clearBtn.addEventListener('click', () => {
  const text = transcriptEl.textContent.trim();
  if (text) {
    historyData.push(text);
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${text}</span>
      <button class="repeatBtn">Repetir no VLibras</button>
    `;
    historyList.prepend(li);

    li.querySelector('.repeatBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        alert('Texto copiado! Clique no botão azul do VLibras e cole para repetir.');
      });
    });
  }

  if (recognition && isListening) recognition.stop();
  fullTranscript = '';
  transcriptEl.textContent = '';
  sendBtn.disabled = true;
});

sendBtn.addEventListener('click', () => {
  const text = transcriptEl.textContent.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    alert('Texto copiado! Clique no botão azul do VLibras e cole o texto para ver a tradução.');
  }).catch(() => {
    alert('Não foi possível copiar o texto. Copie manualmente e cole no VLibras.');
  });
});

downloadBtn.addEventListener('click', () => {
  if (historyData.length === 0) {
    alert("Nenhum histórico para salvar.");
    return;
  }

  const content = historyData.map((t, i) => `${i + 1}. ${t}`).join('\n\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico-libras.txt';
  a.click();

  URL.revokeObjectURL(url);
});
