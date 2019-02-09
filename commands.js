const exec = require('child_process').exec
const ssh2 = require('ssh2').Client
const fs = require('fs')
const os = require('os')

const isRemote = (hostname, user, keyFile) => {
    return (user && keyFile && hostname != os.hostname())
}

module.exports = {
    mac: {
        turnOn: (hostname, user, keyFile) => {
            const command = "caffeinate -u -t 5"

            if (isRemote()) {
                conn = new ssh2()
                conn.on('ready', () => {
                    conn.exec(command, (err, stream) => {
                        stream.on('close', () => { conn.end() })
                    })
                }).connect({
                    host: hostname,
                    username: user,
                    privateKey: fs.readFileSync(keyFile)
                })
            } else {
                exec(command);
            }
        },
        turnOff: (hostname, user, keyFile) => {
            const command = "pmset displaysleepnow"

            if (isRemote()) {
                conn = new ssh2()
                conn.on('ready', () => {
                    conn.exec(command, (err, stream) => {
                        stream.on('close', () => { conn.end() })
                    })
                }).connect({
                    host: hostname,
                    username: user,
                    privateKey: fs.readFileSync(keyFile)
                })
            } else {
                exec(command);
            }
        }
    },
    windows: {
        turnOn: (hostname, user, keyFile) => {},
        turnOff: (hostname, user, keyFile) => {
            exec("powershell (Add-Type '[DllImport(\"user32.dll\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2")
        }
    }
}
