module.exports = class Perks {
    constructor() {
        this.launcherUnlocked = false;
        this.embederUnlocked = false;
        this.mockerUnlocked = false;
    }
    static unlockedToString(perks) {
        if(!Object.entries(perks).some(([key, val]) => val)) return "**NONE**";
        const unlockedList = Object.entries(perks).map(([key, val]) => val ? "- " + key.charAt(0).toUpperCase() + key.slice(1, key.indexOf("Unlocked")) : "")
        return unlockedList.filter(perk => perk !== "").join("\n");
    }
}
