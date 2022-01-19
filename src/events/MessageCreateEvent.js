// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message
const { Client, Message } = require('discord.js');
const BaseEvent = require('../utils/structures/BaseEvent');
const axios = require('axios');
const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')

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
    let isThere = message.attachments.reduce((bool,attachment) => {
      let url = attachment.url;
  
      let { data:img } = await axios.default.get(url, { responseType: 'arraybuffer' });
      
      const model = await nsfw.load();
      const image = await tf.node.decodeImage(img,3);
  
      var predictions = await model.classify(image)
      image.dispose();
  
      if(isNsfw(predictions)) {
        bool = url;
      }
      return bool;
    },false)

    if(isThere) {
      if(message.deletable) {
        message.delete();
        message.guild.owner.send(`${message.author.id}, Send A NSFW Image!\nMessage Deleted Successfully!\nAt: ${message.guild.name}`);
      }else {
        message.guild.owner.send(`${message.author.id}, Send A NSFW Image!\n:x: Cannot Delete The Message (Channel: ${message.channel})\nAt: ${message.guild.name}`);
      }
    }

  }
}

/**
 * 
 * @param {{probability: number, className: 'Hentai' | 'Porn' | 'Sexy' | 'Drawing' | 'Neutral'}[]} nsp 
 */
function isNsfw(nsp) {
  let isNsfw = false;

  if(['Hentai','Porn','Sexy'].includes(nsp[0].className)) {
    isNsfw = true;
  }else {
    if(['Hentai','Porn','Sexy'].includes(nsp[1].className)) {
      if((nsp[1].probability * 100) < 30) {
        isNsfw = false;
      }else {
        isNsfw = true;
      }
    }
  }

  return isNsfw;
}