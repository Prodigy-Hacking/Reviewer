const Discord = require("discord.js");
const {isBugHunter} = require("../utils/isBugHunter.js")
const fetch = require("node-fetch");
const colors = require("../colors.json");
const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const { MessageEmbed } = require("discord.js");

module.exports.run = async (bot, message, args) => {
	const mockMsg = args.slice(0).join(" ");

	message.delete()
	if(!(isBugHunter(message.author.id) && isBugHunter(message.author.id).mockerUnlocked)) return error(`ERROR: Missing permissions. You do not have the mocker perk unlocked.`)
	if(!mockMsg) return error(`ERROR: Incorrect Usage. You must specify a message to mock. Correct Usage: \`${prefix}mock message\``)

	const mockURL = await (await fetch(`https://wt-22f5e1b994607080041c947354b7f9a5-0.run.webtask.io/sponge?message=${mockMsg}`)).text()
	
  	const mockEmbed = new Discord.MessageEmbed()
	  	.setAuthor('Reviewer -', bot.avatarURL)	
		.setTitle("MOCK")
		.setColor(colors.info)
		.setImage(mockURL.slice(1, mockURL.length - 1))
		.setFooter(`Requested by ${message.author.tag}.`)
  	message.channel.sendEmbed(mockEmbed)

  	// Error Handler
	
  	function error(errorMessage) {
		const errorEmbed = new Discord.MessageEmbed()
			.setAuthor("Reviewer -", bot.avatarURL)
			.setTitle("ERROR")
			.setDescription(`${errorMessage}\n Mocker process halted. Please run the command again to restart.`)
			.setColor(colors.error);
		message.channel.send(errorEmbed).then(msg => {
			msg.delete(10000);
		});
	}
};

module.exports.help = {
  	name: "mock",
  	description:"Mock some text just like ~~spongebob~~ spongemock."
};