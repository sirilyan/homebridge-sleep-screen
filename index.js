const OsCommands = require('./commands');

let Service;
let Characteristic;

class ComputerScreen {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.osType = config.osType;
    this.hostname = config.hostname;
    this.username = config.username;
    this.sshKey = config.sshKey;
    this.awake = false;
    this.brightness = 50;

    this.screenService = new Service.Lightbulb(this.name);

    this.screenService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getSwitchOnCharacteristic.bind(this))
      .on('set', this.setSwitchOnCharacteristic.bind(this));

    this.screenService
      .getCharacteristic(Characteristic.Brightness)
      .on('get', this.getSwitchBrightnessCharacteristic.bind(this))
      .on('set', this.setSwitchBrightnessCharacteristic.bind(this));
  }

  getServices() {
    return [this.screenService];
  }

  async getSwitchOnCharacteristic(next) {
    let commands;
    switch (this.osType) {
      case 'windows':
        commands = OsCommands.windows;
        break;
      case 'mac':
      default:
        commands = OsCommands.mac;
        break;
    }

    await commands.updateOn(this);
    next(null, commands.isOn(this));
  }

  setSwitchOnCharacteristic(desiredState, next) {
    const me = this;
    let commands;
    switch (this.osType) {
      case 'windows':
        commands = OsCommands.windows;
        break;
      case 'mac':
      default:
        commands = OsCommands.mac;
        break;
    }

    const currentState = commands.isOn(this);
    if (currentState && !desiredState) {
      me.log('Set display off');
      commands.turnOff(this);
    } else if (!currentState && desiredState) {
      me.log('Set display on');
      commands.turnOn(this);
    }
    next();
  }

  async getSwitchBrightnessCharacteristic(next) {
    const me = this;
    let commands;
    switch (this.osType) {
      case 'windows':
        commands = OsCommands.windows;
        break;
      case 'mac':
      default:
        commands = OsCommands.mac;
        break;
    }

    const currentBrightness = await commands.getBrightness(this);
    me.log(`Current brightness is ${currentBrightness}`);

    next(currentBrightness);
  }

  async setSwitchBrightnessCharacteristic(newBrightness, next) {
    const me = this;
    let commands;
    switch (this.osType) {
      case 'windows':
        commands = OsCommands.windows;
        break;
      case 'mac':
      default:
        commands = OsCommands.mac;
        break;
    }

    me.log(`Setting brightness to ${newBrightness}`);
    await commands.setBrightness(this, newBrightness);

    next(newBrightness);
  }
}

module.exports = (homebridge) => {
  [Service, Characteristic] = [homebridge.hap.Service, homebridge.hap.Characteristic];
  homebridge.registerAccessory('homebridge-screen-standby', 'ComputerScreen', ComputerScreen);
};
