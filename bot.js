const botSettings = require("./botsettings.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Command Handler
fs.readdir("./commands/", (err, files) => {
    if (err) console.error(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length <= 0) {
        console.log("");
        console.log("No commands to be loaded!");
        return;
    }
    // console.log(`\nLoading ${jsfiles.length} commands!\n`)

    jsfiles.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        // console.log(`${i + 1}: ${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });

    console.log(`[Commands]\t Loaded ${jsfiles.length} commands!`);

});

// Event Handler
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.filter(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        if(eventFunction.length <= 0) {
            console.log("No Events to load!");
            return;}
        bot.on(eventName, eventFunction.run.bind(null, bot));
    });
    console.log(`[Events]\t Loaded a total amount of ${files.length} events!`);
});

bot.login(botSettings.token);
