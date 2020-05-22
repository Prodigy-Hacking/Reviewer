const Discord = require('discord.js');
const devsio = require('../utils/devsio.js');
const colors = require('../colors.json');

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    let user = message.mentions.members.first() || message.guild.member(args[0]);
    if(!user) return;
    let userInfo = user.user;
    devsio.readdevs(dataArr => {
        let devList = dataArr;
        if(devList.includes(message.author.id) && devList.includes(user.id)) {
            let embed = new Discord.RichEmbed()
                .setAuthor('Reviewer Devtools -', message.author.avatarURL)
                .setTitle("Delete Dev")
                .setDescription(`Deleted ${userInfo.username + "#" + userInfo.discriminator} from the developer list!`)
                .setColor(colors.dev)
            message.channel.send({embed: embed}).then(message => {
                devList.splice(devList.indexOf(user.id), 1);
                devsio.writedevs(devList, data => {if(!data) console.log("WRITE FAILED.")});
                message.delete(60000);
            }).catch(e => require("../utils/error.js").error(bot, e));
        } else {
            let embed = new Discord.RichEmbed()
                .setAuthor('Reviewer Devtools -', message.author.avatarURL)
                .setTitle("Delete Dev")
                .setDescription(!devList.includes(message.author.id) ? `You do not have permission to run this command!` : `${userInfo.username + "#" + userInfo.discriminator} is not a developer.`)
                .setColor(colors.fail)
            message.channel.send({embed: embed}).then(message => message.delete(60000)).catch(e => require("../utils/error.js").error(bot, e));
        }
    })
}

module.exports.help = {
    name: "deldev",
    description:"Adds a developer to the Reviewer bot.",
    category: ""
}