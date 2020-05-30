const fs = require("fs");

module.exports.isBugHunter = function (id) {
    const data = fs.readFileSync("./bughuntertracker.json", "utf8")
    const bugHunterArr = JSON.parse(data);
    const bugHunter = bugHunterArr.find(bughunter => bughunter.id === id);
    return bugHunter ? bugHunter.perks : false;
}