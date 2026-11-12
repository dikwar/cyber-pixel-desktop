const { app, BrowserWindow, ipcMain, screen } = require('electron');
const os = require('os');
const { exec } = require('child_process');

app.disableHardwareAcceleration();

let mainWindow;

function getCpuUsage() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (let cpu of cpus) {
    user += cpu.times.user; nice += cpu.times.nice;
    sys += cpu.times.sys; idle += cpu.times.idle; irq += cpu.times.irq;
  }
  return { idle, total: user + nice + sys + idle + irq };
}

let startMeasure = getCpuUsage();

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  mainWindow = new BrowserWindow({
    width, height, x: 0, y: 0,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: true
    }
  });

  mainWindow.loadFile('index.html');

  setInterval(() => {
    const endMeasure = getCpuUsage();
    const idleDiff = endMeasure.idle - startMeasure.idle;
    const totalDiff = endMeasure.total - startMeasure.total;
    const cpuPercent = totalDiff > 0 ? Math.round(100 - (100 * idleDiff / totalDiff)) : 0;
    startMeasure = endMeasure;

    const ramPercent = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);

    mainWindow.webContents.send('sys-stats', {
      cpu: cpuPercent,
      ram: ramPercent
    });
  }, 4000);
});

let lastIgnoreState = true;
ipcMain.on('set-ignore-mouse', (event, ignore) => {
  if (lastIgnoreState !== ignore) {
    lastIgnoreState = ignore;
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

ipcMain.on('launch-app', (event, command) => exec(command));
