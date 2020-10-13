const Discord = require("discord.js");
const colors = require("../colors.json");
const BugReport = require("../utils/bugReport.js");
const devsio = require('../utils/devsio.js');
const {isBugHunter} = require("../utils/isBugHunter.js")
const fs = require("fs");
const botSettings = require("../botsettings.json");
const pending_channelid = botSettings.channelid_pendingbugs;
const prefix = botSettings.prefix;
const reasonlimit = botSettings.reasonlimit;
const { MessageEmbed } = require("discord.js");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    let bugReportID = args[0];
    let reason = args.slice(1).join(' ');
    let denier = message.author.tag;
    let denierID = message.author.id;
    let channel = message.channel;

    devsio.readdevs(devs => {
        if(!devs.includes(denierID)) return error("ERROR: You don't have permission to run this command.");

        if(channel.id !== pending_channelid) {
            return error(`ERROR: Incorrect usage. Please use this command in the <#${pending_channelid}> channel.`)
        }
        if(!bugReportID || !reason) {
            return error(`ERROR: Incorrect usage. Run this command with the following format: \`${prefix}forcedeny report_id reason\``)
        }
        if(reason.length > reasonlimit) {
            return error(`ERROR: Reason too long. It must be less than ${reasonlimit} characters.`)
        }
        if(reason.includes("`")) {
            return error("ERROR: Reason cannot contain the ` character.")
        }

        fs.readFile("./reports.json", "utf8", (err, data) => {
            if(err) {
                console.error(err);
                return error(`ERROR: Read from database failed. Please send the following message to Whimpers: (${err})`)
            }
            const reportsArr = JSON.parse(data);
            const report = reportsArr.find(report => report.id === bugReportID);
            if(!report) {
                return error(`No bug report found with id: \`${bugReportID}\`.`);
            }
            if((report.acceptersList.length + report.deniersList.length) > (800 / reasonlimit)) {
                return error(`ERROR: This report has too many testers already.`)
            }
            const rejectance = {
                "denier": denier,
                "reason": reason,
                "force": true
            }
            BugReport.decline(report, rejectance, denierID, bot)
            const reportsJSON = JSON.stringify(reportsArr);
            fs.writeFile('./reports.json', reportsJSON, 'utf8', err => {
                if(err) {
                    console.error(err);
                    return error(`ERROR: Write to database failed. Please send the following message to Whimpers: (${err})`)
                }
            });
        })
        message.delete(0);
    })

    // Error Handler
    
    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor('Reviewer -', bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nBug denial process halted. Please run the command again to restart your report.`)
            .setColor(colors.error)
        channel.send(errorEmbed).then(msg => {
            message.delete(0)
            msg.delete(5000)
        });
    }
}


module.exports.help = {
    name: "forcedeny",
    description:`Force denies a bug report. Can only be run in <#${pending_channelid}> channel by bug hunters.`
}
