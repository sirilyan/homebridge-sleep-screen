"use strict"

const exec = require('child-process-promise').exec
const node_ssh = require('node-ssh')
const os = require('os')

const _isSleeping = []

const isRemote = (hostname) => {
    return (hostname && hostname != os.hostname())
}

const runCommand = async (hostname, user, keyFile, command) => {
    let r
    if (isRemote(hostname)) {
        r = _remoteExec(hostname, user, keyFile, command)
    } else {
        r = _localExec(command)
    }
    return r
}

const _remoteExec = async (hostname, user, keyFile, command) => {
    let conn = new node_ssh()
    return conn.connect({
        host: hostname,
        username: user,
        privateKey: keyFile
    }).then(() => conn.execCommand(command))
}

const _localExec = (command) => {
    return exec(command)
}

module.exports = {
    mac: {
        isOn: (hostname) => !_isSleeping[hostname],
        updateOn: async (hostname, user, keyFile) => {
            const command = "pmset -g powerstate IODisplayWrangler"
            let result = await runCommand(hostname, user, keyFile, command)
            _isSleeping[hostname] = result.stdout.indexOf("USEABLE") == -1
            console.log(_isSleeping)
        },
        turnOn: (hostname, user, keyFile) => {
            const command = "caffeinate -u -t 5"
            runCommand(hostname, user, keyFile, command)
            .then(() => _isSleeping[hostname] = false)
        },
        turnOff: (hostname, user, keyFile) => {
            const command = "pmset displaysleepnow"
            runCommand(hostname, user, keyFile, command)
            .then(() => _isSleeping[hostname] = true)
        }
    },
    windows: {
        turnOn: (hostname, user, keyFile) => { },
        turnOff: (hostname, user, keyFile) => {
            exec("powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2")
        }
    }
}

