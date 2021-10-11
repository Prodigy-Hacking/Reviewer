const Discord = require("discord.js");
const colors = require("../colors.json");
const BugReport = require("../utils/bugReport.js");
const fs = require("fs");
const botSettings = require("../botsettings.json")
const prefix = botSettings.prefix;
const { MessageEmbed } = require("discord.js");
/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    const channel = message.channel;
    const bugReportID = args[0];

    if(!bugReportID) {
        return error(`ERROR: Incorrect usage. Run this command with the following format: \`${prefix}info report_id\``)
    }
    // Submit to bug queue with unique id
    fs.readFile("./reports.json", "utf8", (err, data) => {
        if(err) {
            console.error(err);
            return error(`ERROR: Read from database failed. Please send the following message to Whimpers: (${err})`);
        }
        const reportsArr = JSON.parse(data);
        const report = reportsArr.find(report => report.id === bugReportID);
        if (!report) {
            return error(`ERROR: No bug report found with id: \`${bugReportID}\`.`);
        }
        let reportEmbed = BugReport.createEmbed(report, bot);
        channel.send(reportEmbed);
    });

    // Error Handler
    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nBug report info process halted. Please run the command again to restart your report.`)
            .setColor(colors.error);
        channel.send(errorEmbed).then(msg => msg.delete(5000));
        return new Error(errorMessage);
    }
};


module.exports.help = {
    name: "info",
    description:"Retrives information about a bug report."
};
