const Discord = require("discord.js");
const colors = require("../colors.json");
const { MessageEmbed } = require("discord.js");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    let supportEmbed = new Discord.MessageEmbed()
        .setAuthor("Reviewer -", bot.avatarURL)
        .setTitle("SUPPORT")
        .setDescription("All of our hacks are listed on our github, which can be accessed in the <#683847137511079959> channel. You can also watch this video for a full tutorial on how to hack: https://www.youtube.com/watch?v=yLpxLJ_orOE")
        .setColor(colors.info);
    message.channel.send(supportEmbed);
};


module.exports.help = {
    name: "hackinfo",
    description:"Instructions on how to hack."
};
