const exec = require('child_process').exec
const ssh2 = require('ssh2').Client
const fs = require('fs')
const os = require('os')

const isRemote = (hostname) => {
    return (hostname && hostname != os.hostname())
}

module.exports = {
    mac: {
        isOn: (hostname, user, keyFile) => {
            const command = "pmset -g powerstate IODisplayWrangler"

            if (isRemote(hostname)) {
                let conn = new ssh2()
                let stdout = ""

                conn.on('ready', () => {
                    conn.exec(command, (err, stream) => {
                        stream.on('data', (data) => { stdout += data}
                        ).on('close', () => {
                            conn.end()
                            return (stdout.indexOf("USABLE") != -1)
                        })
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
        turnOn: (hostname, user, keyFile) => {
            const command = "caffeinate -u -t 5"

            if (isRemote(hostname)) {
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

            if (isRemote(hostname)) {
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
