const os = require('os');
const NodeSsh = require('node-ssh');
const cpp = require('child-process-promise');

const { localhost, exec, isAwake } = {
  localhost: os.hostname,
  exec: cpp.exec,
  isAwake: [],
};

const isRemote = hostname => hostname !== localhost();

const remoteExec = (hostname, user, keyFile, command) => {
  const conn = new NodeSsh();
  return conn.connect({
    host: hostname,
    username: user,
    privateKey: keyFile,
  }).then(() => conn.execCommand(command));
};

const localExec = command => exec(command);

const runCommand = async (hostname, user, keyFile, command) => {
  let r;
  if (isRemote(hostname)) {
    r = remoteExec(hostname, user, keyFile, command);
  } else {
    r = localExec(command);
  }
  return r;
};

module.exports = {
  mac: {
    isOn: hostname => isAwake[hostname],
    updateOn: async (hostname, user, keyFile) => {
      const command = 'pmset -g powerstate IODisplayWrangler';
      isAwake[hostname] = await runCommand(hostname, user, keyFile, command)
        .then(result => result.stdout.includes('USEABLE'));
    },
    turnOn: async (hostname, user, keyFile) => {
      const command = 'caffeinate -u -t 5';
      isAwake[hostname] = await runCommand(hostname, user, keyFile, command)
        .then(() => true);
    },
    turnOff: async (hostname, user, keyFile) => {
      const command = 'pmset displaysleepnow';
      isAwake[hostname] = await runCommand(hostname, user, keyFile, command)
        .then(() => false);
    },
  },
  windows: {
    turnOn: async (hostname, user, keyFile) => {
      const command = 'echo hi';
      isAwake[hostname] = await runCommand(hostname, user, keyFile, command)
        .then(() => false);
    },
    turnOff: async (hostname, user, keyFile) => {
      const command = "powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2";
      isAwake[hostname] = await runCommand(hostname, user, keyFile, command)
        .then(() => true);
    },
  },
};
