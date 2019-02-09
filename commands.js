const exec = require('child_process').exec
const ssh2 = require('ssh2').Client
const fs = require('fs')

module.exports = {
    mac: {
        turnOn: function() {
            exec("caffeinate -u -t 5")
        },
        turnOff: function() {
            exec("pmset displaysleepnow")
        }
    },
    remoteMac: {
        turnOn: (hostname, user, keyFile) => {
            conn = new ssh2()
            conn.on('ready', () => {
                conn.exec("caffeinate -u -t 5", (err, stream) => {
                    stream.on('close', () => { conn.end() })
                })
            }).connect({
                host: hostname,
                username: user,
                privateKey: fs.readFileSync(keyFile)
            })
        },
        turnOff: (hostname, user, keyFile) => {
            console.log(user + "@" + hostname + ": key " + keyFile)
            conn = new ssh2()
            conn.on('ready', () => {
                conn.exec("pmset displaysleepnow", (err, stream) => {
                    stream.on('close', () => { conn.end() })
                })
            }).connect({
                host: hostname,
                username: user,
                privateKey: fs.readFileSync(keyFile)
            })
        }
    },
    windows: {
        turnOn: function() {

        },
        turnOff: function() {
            exec("powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2")
        }
    }
}
