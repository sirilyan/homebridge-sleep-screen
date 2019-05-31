/* eslint no-param-reassign: ["error", { "props": false }] */
const os = require('os');
const NodeSsh = require('node-ssh');
const cpp = require('child-process-promise');

const { localhost, exec } = {
  localhost: os.hostname,
  exec: cpp.exec,
};

const isRemote = hostname => hostname && hostname !== localhost();

const remoteExec = (device, command) => {
  const conn = new NodeSsh();
  return conn.connect({
    host: device.hostname,
    username: device.username,
    privateKey: device.sshKey,
  }).then(() => conn.execCommand(command));
};

const localExec = command => exec(command);

const runCommand = async (device, command) => {
  let r;
  if (isRemote(device.hostname)) {
    r = remoteExec(device, command);
  } else {
    r = localExec(command);
  }
  return r;
};

module.exports = {
  mac: {
    isOn: device => device.awake,
    updateOn: async (device) => {
      const command = 'pmset -g powerstate IODisplayWrangler';
      device.awake = await runCommand(device, command)
        .then(result => result.stdout.includes('USEABLE'));
    },
    turnOn: async (device) => {
      const command = 'caffeinate -u -t 5';
      device.awake = await runCommand(device, command)
        .then(() => true);
    },
    turnOff: async (device) => {
      const command = 'pmset displaysleepnow';
      device.awake = await runCommand(device, command)
        .then(() => false);
    },
    getBrightness: async (device) => {
      const command = '/usr/local/bin/brightness -l';
      const originalBrightness = device.brightness;

      device.brightness = await runCommand(device, command)
        .then(result => Math.int(100 * result.stdout.match(/brightness ([01].\d+)/m)[1]))
        .catch(() => originalBrightness);
      return device.brightness;
    },
    setBrightness: async (device, newBrightness) => {
      const command = `/usr/local/bin/brightness -v ${newBrightness / 100}`;
      await runCommand(device, command)
        .then(() => newBrightness);
    },
  },
  windows: {
    isOn: device => device.awake,
    updateOn: async () => true,
    turnOn: async (device) => {
      const command = 'echo hi'; // TODO: this does not actually wake anything, of course
      device.awake = await runCommand(device, command)
        .then(() => false);
    },
    turnOff: async (device) => {
      const command = "powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2";
      device.awake = await runCommand(device, command)
        .then(() => true);
    },
    getBrightness: async () => 100,
    setBrightness: async () => 100,
  },
};
