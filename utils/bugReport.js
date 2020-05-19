const Discord = require("discord.js");
const fetch = require("node-fetch");
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const github_token = botsettings.github_token;
const pending_channelid = botsettings.channelid_pendingbugs;
const approved_channelid = botsettings.channelid_approvedbugs;
const bughunter_roleid = botsettings.roleid_bughunter;
const mintesters = botsettings.mintesters;


module.exports = class BugReport {
    constructor(author, name, desc, reproSteps, expectedResult, actualResult) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.authorID = author.id;
        this.authorTag = author.tag;
        this.name = name;
        this.desc = desc;
        this.reproSteps = reproSteps;
        this.expectedResult = expectedResult;
        this.actualResult = actualResult;
        this.state = "pending";
        this.acceptersList = [];
        this.deniersList = [];
        this.testersList = [];
    }

    static createEmbed(report, bot) {
        function createTestersList(report) {
            if(report.acceptersList.length < 1) {
                if(report.deniersList.length < 1) {
                    return "**NONE**";
                }
                return report.deniersList.join("\n");
            } else {
                if(report.deniersList.length < 1) {
                    return report.acceptersList.join("\n");
                }
                return `${report.acceptersList.join("\n")}\n${report.deniersList.join("\n")}`;
            }
        }
        const colorStateMap = {
            pending: colors.standby,
            approved: colors.valid,
            denied: colors.error
        };
        const bugReportEmbed = new Discord.RichEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle(`BUG REPORT - ID: ${report.id}`)
            .setDescription(`**New bug report submitted by: \`${report.authorTag}\`**`)
            .addField("Name of the affected hack -", report.name)
            .addField("Description of bug -", report.desc)
            .addField("Steps to reproduce bug -", report.reproSteps)
            .addField("Expected result -", report.expectedResult)
            .addField("Actual result -", report.actualResult)
            .addField("Testers -", createTestersList(report))
            .setFooter(`Status: ${report.state}`)
            .setColor(colorStateMap[report.state]);
        return bugReportEmbed;
    }
    static async submit(report, bot) {
        // Submit to pending queue channel
        const pending_channel = bot.channels.find(c => c.id === pending_channelid);
        const pending_embed = BugReport.createEmbed(report, bot);
        const msg = await pending_channel.send(pending_embed);
        report.messageID = await msg.id;
        return await report;
    }
    static edit(report, bot) {
        const newPendingEmbed = BugReport.createEmbed(report, bot);
        const pendingChannel = bot.channels.find(c => c.id === pending_channelid);
        pendingChannel.fetchMessages({around: report.messageID, limit: 1}).then(messages => {
            const fetchedMsg = messages.first();
            fetchedMsg.edit(newPendingEmbed);
        });
    }
    static accept(report, approval, testerID, bot) {
        report.testersList.push(testerID);
        report.acceptersList.push(approval);

        if(report.state == "pending" && report.acceptersList.length >= mintesters) {
            // Resolve bug
            report.state = "approved";

            // Submit to github repo
            function formatReportForGithub(report) {
                function createTestersList(report) {
                    const acceptersList = report.acceptersList.map(acceptor => "- " + acceptor);
                    const deniersList = report.deniersList.map(denier => "- " + denier);
                    if(acceptersList.length < 1) {
                        if(deniersList.length < 1) {
                            return "**NONE**";
                        }
                        return deniersList.join("\n");
                    } else {
                        if(deniersList.length < 1) {
                            return acceptersList.join("\n");
                        }
                        return `${acceptersList.join("\n")}\n${deniersList.join("\n")}`;
                    }
                }
                
                const fieldBuilder = (key, val) => `## ${key}\n${val}`;
                const reportHeader = `# Bug Report - ID: ${report.id}\n#### Submitted by: \`${report.authorTag}\``;
                const reportBody = (
                    "\n\n" + fieldBuilder("Name of affected hack", report.name) +
                    "\n\n" + fieldBuilder("Description of bug", report.desc) +
                    "\n\n" + fieldBuilder("Steps to reproduce", report.reproSteps.split(/,\s*/).map(step => "- " + step).join("\n")) +
                    "\n\n" + fieldBuilder("Expected results", report.expectedResult) +
                    "\n\n" + fieldBuilder("Actual results", report.actualResult) +
                    "\n\n" + fieldBuilder("Testers", createTestersList(report))
                );

                return reportHeader + reportBody;
            }
            
            const issueBody = {
                "title": `AUTO BUG SYSTEM: ${report.name}`,
                "body": formatReportForGithub(report),
                "labels": ["Bug", "ABS"] 
            };

            fetch("https://api.github.com/repos/Prodigy-Hacking/ProdigyMathGameHacking/issues", {
                "method": "POST",
                "body": JSON.stringify(issueBody),
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": `token ${github_token}`
                }
            })
                .then(res => res.json())
                .then(json => {
                    if (json.Status == 201) {
                        console.log(`Issue created at ${json.status.Location}`);
                    }
                    else {
                        console.log(`Something went wrong. Response: ${JSON.stringify(json)}`);
                    }
                });

            // Submit to approved queue channel
            const approved_channel = bot.channels.find(c => c.id === approved_channelid);
            const approved_embed = BugReport.createEmbed(report, bot);
            approved_channel.send(approved_embed);

            // Give submission user bug hunter role
            const guild = bot.channels.find(c => c.id === pending_channelid).guild;
            let role = guild.roles.find(r => r.id === bughunter_roleid);
            let member = guild.members.find(m => m.id === report.authorID);
            member.addRole(role);
        }
        BugReport.edit(report, bot);
    }
    static decline(report, denial, testerID, bot) {
        report.testersList.push(testerID);
        report.deniersList.push(denial);

        if(report.state == "pending" && report.deniersList.length >= mintesters) {
            // Resolve bug
            report.state = "denied";
        }
        BugReport.edit(report, bot);
    }
};