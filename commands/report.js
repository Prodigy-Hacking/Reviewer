const Discord = require("discord.js");
const colors = require("../colors.json");
const BugReport = require("../utils/bugReport.js");
const fs = require("fs");
const { MessageEmbed } = require("discord.js");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    const member = message.author;
    const channel = message.channel;

    const bugFormDialogue = {
        name: "Please enter the name of the affected script/hack.",
        desc: "Please write a short description about the bug.",
        reproSteps: "Please write out the steps needed to reproduce the error. Seperate each step by a comma.",
        expectedResult: "Please enter the expected result of the script. (The one that would occur if the bug were fixed.)",
        actualResult: "Please enter the actual result of the script. (The one that occurs now.)"
    };
    
    if(bot.reporting.has(member.id)) return;
    if(channel.type != "dm") {
        message.delete();
        return error("ERROR: Please run this command in a DM.");
    } else {
        bot.reporting.add(member.id);
        await bugForm(channel);
        bot.reporting.delete(member.id);

        const confirmationEmbed = new Discord.MessageEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("SUCCESS")
            .setDescription("Your bug report has been successfully sent! If it gets accepted, you can become a bug hunter! :tada:") 
            .setColor(colors.valid);
        await channel.send(confirmationEmbed);
    }

    // Ask for additional information for bug submission
    async function bugForm(channel) {
        let dialogueResults = [];
        for (const line of Object.entries(bugFormDialogue)) {
            const dialogueEmbed = new Discord.MessageEmbed()
                .setAuthor("Reviewer -", bot.avatarURL)
                .setTitle("BUG REPORT FORM")
                .setDescription(line) 
                .setColor(colors.info);
            await channel.send(dialogueEmbed).then(async () => await waitForResponse(dialogueResults));
        }
        
        let report = new BugReport(member, ...dialogueResults);
        await submit(report);
    }
    async function waitForResponse(dialogueResults) {
        let filter = m => m.author.id === member.id && !m.author.bot;
        await channel.awaitMessages((() => true), {max: 1}).then(async (collected) => {
            collected.forEach(async (msg) => {
                await Promise.resolve(
                    filter(msg) ? msg.content : await waitForResponse(dialogueResults)
                ).then(val => dialogueResults.push(val.slice(0, 800)));
            });
        });
    }
    // Submit to bug queue with unique id
    async function submit(bugReport) {
        bugReport = await BugReport.submit(bugReport, bot);
        fs.readFile("./reports.json", "utf8", (err, data) => {
            if(err) return console.error(err);
            const reportsArr = JSON.parse(data);


            const reportsJSON = JSON.stringify(reportsArr);
            fs.writeFileSync("./reports.json", reportsJSON, "utf8", err => {
                if(err) console.error(err);
            });
        });
    }

    // Error Handler

    function error(errorMessage) {
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nBug reporting process halted. Please run the command again to restart your report.`)
            .setColor(colors.error);
        channel.send(errorEmbed).then(msg => msg.delete(5000));
        return new Error(errorMessage);
    }
};


module.exports.help = {
    name: "report",
    description:"Issues a new bug report. Can only be run in a DM with the Reviewer bot."
};
