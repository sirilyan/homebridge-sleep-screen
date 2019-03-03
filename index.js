"use strict"

const OsCommands = require('./commands')

let Service, Characteristic

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-screen-standby", "ComputerScreen", ComputerScreen);
}

function ComputerScreen(log, config, api) {
    this.log = log;
    this.name = config["name"]
    this.osType = config["osType"]
    this.hostname = config["hostname"]
    this.username = config["username"]
    this.sshKey = config["sshKey"]

    this.screenService = new Service.Switch(this.name);

    this.screenService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getSwitchOnCharacteristic.bind(this))
        .on('set', this.setSwitchOnCharacteristic.bind(this));
}

ComputerScreen.prototype.getServices = function getServices() {
    return [this.screenService]
}

ComputerScreen.prototype.getSwitchOnCharacteristic = async function (next) {
    let commands;
    switch (this.osType) {
        case 'windows':
            commands = OsCommands.windows
            break;
        case 'mac':
        default:
            commands = OsCommands.mac
            break;
    }

    await commands.updateOn(this.hostname, this.username, this.sshKey)
    next(null, commands.isOn(this.hostname))
}

ComputerScreen.prototype.setSwitchOnCharacteristic = function (on, next) {
    const me = this
    let commands;
    switch (this.osType) {
        case 'windows':
            commands = OsCommands.windows
            break;
        case 'mac':
        default:
            commands = OsCommands.mac
            break;
    }

    if (commands.isOn(this.hostname)) {
        me.log(`Set display off`)
        commands.turnOff(this.hostname, this.username, this.sshKey)
    } else {
        me.log(`Set display on`)
        commands.turnOn(this.hostname, this.username, this.sshKey)
    }
    return next()
}


