const Discord = require("discord.js");
const fetch = require("node-fetch");
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const github_token = botsettings.github_token;
const pending_channelid = botsettings.channelid_pendingbugs;
const approved_channelid = botsettings.channelid_approvedbugs;
const bughunter_roleid = botsettings.roleid_bughunter;
const mintesters = botsettings.mintesters;
const version = botsettings.version;


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
        this.notersList = [];
        this.notes = [];
        this.version = version;
    }
    /**
     * Better System by Top down Inheritance and bottom to top functionality
     * BugReport takes an id (this is all it takes)
     *      Constructor
     *          takes data from user
     *          Message (takes a message id of embed)
     *              edit (edits message)
     *              submit (submits message)
     *              TesterLists
     *                  CONST MAX
     *                  TOTAL
     *                  AcceptorList
     *                      submit(): Update total after check total < max
     *                  Denier List
     *                      submit(): Update total after check total < max
     *              NoteList
     *                  CONST MAX
     *                  TOTAL
     *                  Note
     *                      submit(): Update total after check total < max
     * 
     * Embed titles are limited to 256 characters
     * Embed descriptions are limited to 2048 characters
     * There can be up to 25 fields
     * A field's name is limited to 256 characters and its value to 1024 characters
     * The footer text is limited to 2048 characters
     * The author name is limited to 256 characters
     * In addition, the sum of all characters in an embed structure must not exceed 6000 characters
     * A bot can have 1 embed per message
     * A webhook can have 10 embeds per message
     * 
     * 
     * 
     * TODO:
     * Seperate functions by purpose
     * Standardize classes/functions?
     * Keep functions in correct parent class
     * Create classes based on functions needed
     * Attach github link to completed issue (ill do that now)
     * 
     * 
     * If a report is not pending, it shouldn't accept more testers.
     * Max testers --> (2 * AcceptedTesters) - 1
     * Max reason  --> (8 * 100) / MaxTesters
     * 
     * While the report is pending, you can accept/deny.
     *      If you've already accepted/denied that issue
     *          Remove your previous accept/deny
     *      Add the new accept/deny + reason to the end
     *
     * Notes should be added to the github
     * 
     * Once a report is accepted, make an issue on github, and attach the resulting link onto the embed
     * 
     */
    static createEmbed(report, bot) {
        function createTestersList(report) {
            const acceptersList = report.acceptersList.map(acceptor => acceptor.reason || acceptor)
            const deniersList = report.deniersList.map(denier => denier.reason || denier)
            if(acceptersList.length < 1) {
                if(deniersList.length < 1) return "**NONE**"
                return deniersList.join("\n")
            } else {
                if(deniersList.length < 1) {
                    return acceptersList.join("\n")
                }
                return `${acceptersList.join("\n")}\n${deniersList.join("\n")}`
            }
        }
        function createNotesList(report) {
            if(!report.notes) report.notes = []
            const notes = report.notes.map(note => note.reason || note)
            if(notes.length < 1) return "**NONE**";
            return notes.join("\n");
        }
        const colorStateMap = {
            pending: colors.standby,
            approved: colors.valid,
            denied: colors.error
        };
        const bugReportEmbed = new Discord.RichEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle(`BUG REPORT - ID: ${report.id}`)
            .setDescription(`**New bug report submitted by**: \`${report.authorTag}\``)
            .addField("Name of the affected hack -", report.name)
            .addField("Description of bug -", report.desc)
            .addField("Steps to reproduce bug -", report.reproSteps)
            .addField("Expected result -", report.expectedResult)
            .addField("Actual result -", report.actualResult)
            .addField("Testers -", createTestersList(report))
            .addField("Notes -", createNotesList(report))
            .setFooter(`Status: ${report.state}`)
            .setColor(colorStateMap[report.state])
        if(report.url) bugReportEmbed.setURL(report.url)
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
    static addNote(report, note, noterID, bot) {
        const noteStr = `:pencil: **${note.noter}**: \`${note.note}\``;

        if(!report.notes) report.notes = [];
        if(!report.notersList) report.notersList = [];
        report.notersList.push(noterID);
        report.notes.push({id: noterID, reason: noteStr});

        BugReport.edit(report, bot)
    }
    static async accept(report, approval, testerID, bot) {
        const acceptanceStr = `:white_check_mark: **${approval.acceptor}**: \`${approval.reason}\``;
        if(report.testersList.includes(testerID)) {
            if(report.version !== 1) return BugReport.error("The edit test response feature is only for bug reports > version `1.0.0`", bot);
            report.testersList = report.testersList.filter(e => e !== testerID);
            report.deniersList = report.deniersList.filter(e => e.id !== testerID);
            report.acceptersList = report.acceptersList.filter(e => e.id !== testerID);
        }
        report.testersList.push(testerID);
        report.acceptersList.push({id: testerID, reason: acceptanceStr});

        if(report.state == "pending" && (report.acceptersList.length >= mintesters || approval.force)) {
            // Resolve bug
            report.state = "approved";

            // Submit to github repo
            function formatReportForGithub(report) {
                function createTestersList(report) {
                    const acceptersList = report.acceptersList.map(acceptor => "- " + acceptor.reason || acceptor)
                    const deniersList = report.deniersList.map(denier => "- " + denier.reason || denier)
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
                function createNotesList(report) {
                    if(!report.notes) report.notes = []
                    const notes = report.notes.map(note => "- " + note.reason || note)
                    if(notes.length < 1) return "**NONE**";
                    return notes.join("\n");
                }
                
                const fieldBuilder = (key, val) => `## ${key}\n${val}`;
                const reportHeader = `# Bug Report - ID: ${report.id}\n#### Submitted by: \`${report.authorTag}\``;
                const reportBody = (
                    "\n\n" + fieldBuilder("Name of affected hack", report.name) +
                    "\n\n" + fieldBuilder("Description of bug", report.desc) +
                    "\n\n" + fieldBuilder("Steps to reproduce", report.reproSteps.split(/,\s*/).map(step => "- " + step).join("\n")) +
                    "\n\n" + fieldBuilder("Expected results", report.expectedResult) +
                    "\n\n" + fieldBuilder("Actual results", report.actualResult) +
                    "\n\n" + fieldBuilder("Testers", createTestersList(report)) +
                    "\n\n" + fieldBuilder("Notes", createNotesList(report))
                );

                return reportHeader + reportBody;
            }
            
            const issueBody = {
                "title": `AUTO BUG SYSTEM: ${report.name}`,
                "body": formatReportForGithub(report),
                "labels": ["Bug", "ABS"] 
            };

            const jsonRes = await fetch("https://api.github.com/repos/Prodigy-Hacking/ProdigyMathGameHacking/issues", {
                "method": "POST",
                "body": JSON.stringify(issueBody),
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": `token ${github_token}`
                }
            })
            .then(res => res.json());
            report.url = await jsonRes.html_url;

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
        const rejectanceStr = `:x: **${denial.denier}**: \`${denial.reason}\``;
        if(report.testersList.includes(testerID)) {
            if(report.version !== 1) return BugReport.error("The edit test response feature is only for bug reports > version `1.0.0`", bot);
            report.testersList = report.testersList.filter(e => e !== testerID);
            report.deniersList = report.deniersList.filter(e => e.id !== testerID);
            report.acceptersList = report.acceptersList.filter(e => e.id !== testerID);
        }
        report.testersList.push(testerID);
        report.deniersList.push({id: testerID, reason: rejectanceStr});

        if(report.state == "pending" && (report.deniersList.length >= mintesters || denial.force)) {
            // Resolve bug
            report.state = "denied";
        }
        BugReport.edit(report, bot);
    }

    // Error Handler
    
    static error(errorMessage, bot) {
        const channel = bot.channels.find(c => c.id === pending_channelid);
        const errorEmbed = new Discord.RichEmbed()
            .setAuthor('Reviewer -', bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nBug report system process halted. Please run the command again to restart your report.`)
            .setColor(colors.error)
        channel.send(errorEmbed).then(msg => msg.delete(5000));
    }
}
