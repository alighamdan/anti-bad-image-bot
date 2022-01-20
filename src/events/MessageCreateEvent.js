const { Client, Message } = require('discord.js');
const BaseEvent = require('../utils/structures/BaseEvent');
const axios = require('axios');
const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')
const isImage = require('is-image');
const db = require('../commands/anti-badimage/data.json');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }
  
  /**
   * 
   * @param {Client} client 
   * @param {Message} message 
   */
  async run(client, message) {
    if(!message.guild) return;
    if(message.attachments.size === 0) return;
    if(!db[message.guild.id]) return;
    if(db[message.guild.id] === 'off') return;

    let isThere = await message.attachments.reduce(
     async function(bool,attachment) {
      let url = attachment.url;

      let uurl = url.replace(new URL(url).search,'');
      if(!isImage(uurl)) return;
      let { data:img } = await axios.default.get(url, { responseType: 'arraybuffer' });
      
      try{
      const model = await nsfw.load();
      
      const image = await tf.node.decodeImage(img,3);
  
      var predictions = await model.classify(image)
      image.dispose();
      
      } catch(e) {
        console.log(`${message.author.id} (${message.author.name})\nSend Some attachments And Can't Modify Them`)
      }
      if(isNsfw(predictions)) {
        bool = true;
      }
      return bool;
    },false)

    if(isThere) {
      console.log(message.author.username,isThere)
      if(message.deletable) {
        message.delete();
        // message.guild.owner.send(`${message.author.id}, Send A NSFW Image!\nMessage Deleted Successfully!\nAt: ${message.guild.name}`);
      }else {
        // message.guild.owner.send(`${message.author.id}, Send A NSFW Image!\n:x: Cannot Delete The Message (Channel: ${message.channel})\nAt: ${message.guild.name}`);
      }
    }
  }
}


function isNsfw(nsp) {
  if(['Neutral','Drawing'].includes(nsp[0].className) ) {
    return false;
  }else if(['Porn','Hentai'].includes(nsp[1].className) &&
  nsp[1].probability > 0.6) return true;
  else return false
}
