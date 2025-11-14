const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendToVlibrasBtn');
const transcriptEl = document.getElementById('transcript');
const langSelect = document.getElementById('langSelect');
const historyList = document.getElementById('historyList');
const downloadBtn = document.getElementById('downloadHistoryBtn');

let recognition = null;
let isListening = false;
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
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) {
        const frase = res[0].transcript.trim();
        transcriptEl.textContent = frase;
        sendBtn.disabled = false;
        historyData.push(frase);

        const li = document.createElement('li');
        li.innerHTML = `
          <span>${frase}</span>
          <button class="repeatBtn">Repetir no VLibras</button>
        `;
        historyList.prepend(li);

        li.querySelector('.repeatBtn').addEventListener('click', () => {
          navigator.clipboard.writeText(frase).then(() => {
            alert('Texto copiado! Clique no botão azul do VLibras e cole para repetir.');
          });
        });
      }
    }
  };

  recognition.onerror = (e) => {
    console.error('Erro no reconhecimento:', e.error);
  };

  recognition.onend = () => {
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };
}

initSpeechRecognition();

startBtn.addEventListener('click', () => {
  transcriptEl.textContent = '';
  sendBtn.disabled = true;
  recognition.lang = langSelect.value;
  recognition.start();
});

stopBtn.addEventListener('click', () => {
  if (recognition && isListening) recognition.stop();
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
  a.download = 'historico-crisma-libras.txt';
  a.click();

  URL.revokeObjectURL(url);
});
