# homebridge-sleep-screen

[![npm version](https://badge.fury.io/js/homebridge-standby-screen.svg)](https://badge.fury.io/js/homebridge-standby-screen)
[![Known Vulnerabilities](https://snyk.io/test/github/elad-lachmi/homebridge-sleep-screen/badge.svg?targetFile=package.json)](https://snyk.io/test/github/elad-lachmi/homebridge-sleep-screen?targetFile=package.json)
[![dependencies](https://david-dm.org/elad-lachmi/homebridge-sleep-screen.svg)]()

## OS Support

### MacOS

macOS 10.9 or later is supported. The plugin uses the `pmset` and `caffeinate` commands to
sleep and wake the Mac, respectively. You must also install Nicholas Riley's
[`brightness`](https://github.com/nriley/brightness) package to manage screen brightness.

### Windows 10

There is limited Windows 10 support. You can put the screen to sleep, but cannot wake it.
You are also unable to change the display brightness.

The plugin uses PowerShell to perform these actions.

## Configuration

```json
    {
        "accessory": "ComputerScreen",
        "name": "Windows Laptop (local)",
        "osType": "windows"
    }
```

```json
    {
        "accessory": "ComputerScreen",
        "name": "Mac Desktop (remote)",
        "osType": "mac",
        "hostname": "my-imac.local",
        "username": "elad",
        "sshKey": "/home/elad/.ssh/id_rsa"
    }
```

`osType` can be mac or windows. The default is mac.

## Remote control

By default, this plugin controls the computer that is running homebridge. If you want to
remotely control a different computer, you can do so through ssh. Once you have added your
ssh key to the remote system, set the `hostname`, `username`, and `sshKey` parameters.

Remote control works only on macOS right now.

## TODO

### Mac

Altering the brightness of secondary displays may not work.

### Windows

It is not possible to wake a Windows system, nor to adjust the brightness.
Remote control has not been implemented.

### Linux/BSD

No support yet.