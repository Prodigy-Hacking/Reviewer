const Discord = require("discord.js");
const fs = require("fs");
const Perks = require("../utils/perks.js")
const colors = require("../colors.json");
const botsettings = require("../botsettings.json");
const storeJSON = require("../store.json");
const prefix = botsettings.prefix;
const bugHunterRoleID = botsettings.roleid_bughunter;

const perksPath = "../utils/Perks/";

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.TextChannel} channel
 */
module.exports.run = async (bot, message, args) => {
    let channel = message.channel;
    let member = message.author;
    let item = args.slice(0).join(" ");
    let storeItems = {};
    Object.entries(storeJSON).forEach(([key, val]) => storeItems[key.split("_").map(perk => perk.charAt(0).toUpperCase() + perk.slice(1)).join(" ")] = val);

    if(!item) return error(`ERROR: Incorrect usage. Please specify an item to buy using: \`${prefix}buy Item_Name\`. If you are unsure of this item's name, you can use \`${prefix}store\` to check it.`)
    item = item.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    if(!(storeItems.hasOwnProperty(item) || item.startsWith("Color Roles"))) return error(`ERROR: Incorrect usage. Could not find an item with the name of \`${item}\`. If you are unsure of this item's name, you can use \`${prefix}store\` to check it.`)

    const tierColors = [colors.tier0, colors.tier1, colors.tier2, colors.tier3, colors.tier4, colors.tier5]
    const tierRomanNumerals = ["I", "II", "III", "IV", "V"]
    // Get user info
    fs.readFile("./bughuntertracker.json", "utf8", async (err, data) => {
        if(err) return console.error(err);
        const bugHunterArr = JSON.parse(data);
        const bugHunter = bugHunterArr.find(bughunter => bughunter.id === member.id);
        if(bugHunter) {
            const storeItem = storeItems[item] || storeItems["Color Roles"];
            if(bugHunter.tokens < storeItem.tokens) return error(`ERROR: You do not have enough tokens to buy this item, you need \`${storeItem.tokens - bugHunter.tokens}\` more Bug Token.`);
            try {
                if(item.startsWith("Color Roles")) {
                    const perkUnlockResponse = await buyColorRole(args[2]);
                    if(perkUnlockResponse !== true) return error(perkUnlockResponse);
                } else {
                    const perk = require(`${perksPath + item}.js`)
                    const perkUnlockResponse = perk.unlock(channel.guild, bugHunter);
                    if(perkUnlockResponse !== true) return error(perkUnlockResponse);
                }
                bugHunter.tokens -= storeItem.tokens;
            } catch (err) {
                return error(`ERROR: This item has not been implemented: \`(${err})\``)
            }
        } else return error("ERROR: Only Bug Hunters can use the store! If you would like to become a bug hunter, check out the <#711987145392390254> channel.");
        const bugHunterJSON = JSON.stringify(bugHunterArr);
        fs.writeFile("./bughuntertracker.json", bugHunterJSON, "utf8", err => {
            if(err) {
                console.error(err);
                return error(`ERROR: Write to database failed. Please send the following message to Whimpers: (${err})`);
            }
        });
        const confirmationEmbed = new Discord.RichEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("SUCCESS")
            .setDescription("Your purchase was successfull! :tada:") 
            .setColor(colors.valid);
        channel.sendEmbed(confirmationEmbed).then(msg => msg.delete(5000));
    });

    message.delete(0);

    async function buyColorRole(color) {
        if(!color) return `ERROR: Incorrect Usage. Please specify a color. Correct usage: \`${prefix}buy Color Roles color\``;
        if(!(/^#[0-9A-Fa-f]{6}$/).test(color)) return "ERROR: Color must be in a hex format. Example: #f00ba7";
        const bugHunterRole = message.guild.roles.find(r => r.id === bugHunterRoleID);
        const colorRole = await channel.guild.createRole({
            name: color,
            color: color,
            position: bugHunterRole.position
        })
        message.guild.member(member).addRole(colorRole)
        return true;
    }

    // Error Handler
    
    function error(errorMessage) {
        const errorEmbed = new Discord.RichEmbed()
            .setAuthor("Reviewer -", bot.avatarURL)
            .setTitle("ERROR")
            .setDescription(`${errorMessage}\nPurchase process halted. Please run the command again to restart.`)
            .setColor(colors.error);
        channel.send(errorEmbed).then(msg => {
            message.delete(0);
            msg.delete(10000);
        });
    }
};


module.exports.help = {
    name: "buy",
    description:"Purchases a perk from the store."
};
