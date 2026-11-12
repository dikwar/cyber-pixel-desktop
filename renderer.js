const { ipcRenderer } = require('electron');

// 1. Update Jam Digital
setInterval(() => {
  document.getElementById('clock').innerText = new Date().toTimeString().split(' ')[0];
}, 1000);

// 2. Cek Baterai Bawaan
if (navigator.getBattery) {
  navigator.getBattery().then(bat => {
    const updateBat = () => {
      const level = Math.round(bat.level * 100);
      document.getElementById('battery-text').innerText = `${level}%`;
      document.getElementById('battery-fill').style.width = `${level}%`;
    };
    updateBat();
    bat.addEventListener('levelchange', updateBat);
  });
}

// 3. Terima Data CPU & RAM
ipcRenderer.on('sys-stats', (event, data) => {
  document.getElementById('cpu-val').innerText = `${data.cpu}%`;
  document.getElementById('ram-val').innerText = `RAM: ${data.ram}%`;
  document.getElementById('bot-msg').innerText = `SYS_OK // CPU:${data.cpu}% @$`;
});

// 4. Animasi Matrix Hemat CPU (Update tiap 2 detik)
const chars = '0123456789ABCDEF$#@%';
const matrixBox = document.getElementById('matrix-log');
let lines = [];
setInterval(() => {
  let row = '';
  for (let i = 0; i < 22; i++) row += chars[Math.floor(Math.random() * chars.length)] + ' ';
  lines.push(row);
  if (lines.length > 5) lines.shift();
  matrixBox.innerText = lines.join('\n');
}, 2000);

// 5. Buka Aplikasi dari Dock & Terminal
function openApp(command) {
  ipcRenderer.send('launch-app', command);
}

const cmdInput = document.getElementById('cmd-input');
cmdInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = cmdInput.value.trim().toLowerCase();
    if (val === 'code') openApp('code');
    else if (val === 'calc') openApp('calc');
    else if (val === 'explorer') openApp('explorer');
    else if (val === 'clear') lines = [];
    document.getElementById('bot-msg').innerText = `EXEC: > ${val}`;
    cmdInput.value = '';
  }
});

// 6. Deteksi Mouse Hemat CPU (Hanya saat masuk/keluar kotak widget)
document.querySelectorAll('.interactive').forEach(el => {
  el.addEventListener('mouseenter', () => ipcRenderer.send('set-ignore-mouse', false));
  el.addEventListener('mouseleave', () => ipcRenderer.send('set-ignore-mouse', true));
});
ipcRenderer.send('set-ignore-mouse', true);
