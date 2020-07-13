const Discord = require('discord.js');
const {isBugHunter} = require("../utils/isBugHunter.js")
const colors = require("../colors.json");
const takeOff = new Discord.Attachment("./assets/takeOff.jpeg", "takeOff.jpeg");
const launchSuccess = new Discord.Attachment("./assets/launchSuccess.gif", "launchSuccess.gif");
const launchFail = new Discord.Attachment("./assets/launchFail.gif", "launchFail.gif");

module.exports.run = async (bot, message, args) => {
    const user = message.mentions.users.first() || message.author;
    const randomNumber = Math.round(Math.random());

    message.delete()
    if(!(isBugHunter(message.author.id) && isBugHunter(message.author.id).launcherUnlocked)) return error(`ERROR: Missing permissions. You do not have the launcher perk unlocked.`)
    
    const launchEmbed = new Discord.RichEmbed()
        .setAuthor('Reviewer -', bot.avatarURL)
        .setTitle('LAUNCH')
    
    if(randomNumber) {
        launchEmbed.addField(`${user.username} was launched into space by ${message.author.username}!`, `${user.username}'s rocket flew to space!`);
        launchEmbed.attachFile(launchSuccess)
        launchEmbed.setImage("attachment://launchSuccess.gif");
        launchEmbed.setColor(colors.valid)
    } else {
        launchEmbed.addField(`${user.username} was launched into space by ${message.author.username}!`, `${user.username}'s rocket blew up!`);
        launchEmbed.attachFile(launchFail)
        launchEmbed.setImage("attachment://launchFail.gif");
        launchEmbed.setColor(colors.error)
    }

    message.channel.sendEmbed(launchEmbed)
    
    // Error Handler
    
    function error(errorMessage) {
        const errorEmbed = new Discord.RichEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nLauncher process halted. Please run the command again to restart.`)
            .setColor(colors.error);
        message.channel.send(errorEmbed).then(msg => {
            msg.delete(10000);
        });
    }
}

module.exports.help = {
    name: "launch",
    description:"Launch someone into space!"
}