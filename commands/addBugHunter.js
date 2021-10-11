const Discord = require("discord.js");
const fs = require("fs");
const Perks = require("../utils/perks.js");
const devsio = require('../utils/devsio.js');
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const prefix = botsettings.prefix;
const { MessageEmbed } = require("discord.js");

module.exports.run = async (bot, message, args) => {
    const member = message.guild.member(message.mentions.members.first() || args[0]);
    const confirmationEmbed = new Discord.MessageEmbed()
        .setAuthor("Reviewer -", bot.avatarURL)
        .setTitle("SUCCESS")
        .setDescription("This user is now a bug hunter! :tada:") 
        .setColor(colors.valid)
    
    message.delete()

    if(!member) return error(`ERROR: Incorrect usage. You must specify the member to add as a bug hunter. Correct Usage: \`${prefix}addbughunter bug_hunter\``);

    devsio.readdevs(devs => {
        if(!devs.includes(message.author.id)) return error("ERROR: Missing Permissions. You are not allowed to run this command.")
        fs.readFile("./bughuntertracker.json", "utf8", async (err, data) => {
            if(err) return console.error(err);
            const bughunterArr = await JSON.parse(data);
            const bughunter = bughunterArr.find(bughunter => bughunter.id === member.id);
            if(!bughunter)
                bughunterArr.push({id: member.id, tokens: 0, tier: 0, perks: new Perks()})
            else return error("ERROR: This user is already a bug hunter");
            const bughunterJSON = JSON.stringify(bughunterArr);
            fs.writeFile("./bughuntertracker.json", bughunterJSON, "utf8", err => {
                if(err) console.error(err);
            });
            message.channel.sendEmbed(confirmationEmbed).then(msg => msg.delete(5000));
        });
    });

    // Error Handler
    
    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nBug Hunter Addition process halted. Please run the command again to restart.`)
            .setColor(colors.error);
        message.channel.send(errorEmbed).then(msg => {
            message.delete(0);
            msg.delete(10000);
        });
    }
}
module.exports.help = {
    name: "addbughunter",
    description:"Adds a bug hunter."
};
