const Discord = require("discord.js");
const {isBugHunter} = require("../utils/isBugHunter.js")
const botSettings = require("../botsettings.json");
const colors = require("../colors.json");
const prefix = botSettings.prefix;
const { MessageEmbed } = require("discord.js");

module.exports.run = async (bot, message, args) => {
    message.delete();

    if(!(isBugHunter(message.author.id) && isBugHunter(message.author.id).embederUnlocked)) return error(`ERROR: Missing permissions. You do not have the embeder perk unlocked.`)
    if(args.length < 1) return error(`ERROR: Incorrect usage. You must specify a message to embed. Correct usage: \`${prefix}embed color message\``);

    const colorTester = args[0];
    let color;
    let msg = args.slice(1).join(" ");

    if((/[0-9A-Fa-f]{6}/g).test(colorTester)) {
        color = colorTester;
    } else {
        msg = args.slice(0).join(" ");
    }

    let embed = new Discord.MessageEmbed()
        .setTitle(msg)
        .setColor(color || colors.info)
        .setFooter("- " + message.author.tag)
    message.channel.send(embed);

    // Error Handler

    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor('Reviewer -', bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nEmbeder process halted. Please run the command again to restart your report.`)
            .setColor(colors.error)
        message.channel.send(errorEmbed).then(msg => {
            message.delete(0)
            msg.delete(5000)
        });
    }
}

module.exports.help = {
    name: "embed",
    description: "Creates an embed with specified message"
}