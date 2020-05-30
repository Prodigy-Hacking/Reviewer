const role_id = require("../../botsettings.json").roleid_bughunter_tiers[1]

module.exports.unlock = function (guild, bugHunter) {
    if(bugHunter.tier < 1) return `ERROR: You can't purchase this tier without purchasing the previous one first.`
    if(bugHunter.tier > 1) return `ERROR: We stopped you from purchasing this perk because you already have it.`;

    // Give Tier Role
    const role = guild.roles.find(r => r.id === role_id);
    const member = guild.members.find(m => m.id === bugHunter.id)
    member.addRole(role);

    // Update Tier
    bugHunter.tier = 2;

    return true;
}