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
    this.currentStatus = true
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

ComputerScreen.prototype.getSwitchOnCharacteristic = function (next) {
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

    if (commands.isOn) {
        me.currentStatus = commands.isOn()
    }

    me.log(`Returned current state: ${me.currentStatus}`);
    return next(null, me.currentStatus)
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
    me.log(`Set display to ${on ? 'on' : 'off'}`)
    me.currentStatus = !me.currentStatus
    if (!me.currentStatus) {
        commands.turnOff(this.hostname, this.username, this.sshKey)
    } else {
        commands.turnOn(this.hostname, this.username, this.sshKey)
    }
    return next()
}
