const BaseCommand = require('../../utils/structures/BaseCommand');
const fs = require('fs');
const db = require('./data.json');
const { Message, Client } = require('discord.js');

module.exports = class Toggle_antiCommand extends BaseCommand {
  constructor() {
    super('toggle-anti', 'anti-badimag', []);
  }

  /**
   * 
   * @param {Client} client 
   * @param {Message} message 
   * @param {String[]} args 
   */
  async run(client, message, args) {
    if(!message.member.hasPermission("ADMINISTRATOR")) return;

    if(!db[message.guild.id]) db[message.guild.id] = 'off';

    if(db[message.guild.id] === 'off') {
      db[message.guild.id] = "on";
      fs.writeFileSync(__dirname+'/data.json',JSON.stringify(db));
      return message.reply(`Anti Image Now **On**`);
    }else {
      db[message.guild.id] = "off";
      fs.writeFileSync(__dirname+'/data.json',JSON.stringify(db));
      return message.reply(`Anti Image Now **Off**`);
    }
  }
}