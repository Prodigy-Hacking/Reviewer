const fs = require("fs");

module.exports = {
    readdevs: function readdevs(callback) {
        fs.readFile("./devs.txt", (err, data) => {
            if(err) console.error(err);
            let dataStr = data.toString();
            let dataArr = dataStr.split("\n");
            return callback(dataArr);
        })
    },
    writedevs: function writedevs(devArr, callback) {
        var devListStr = devArr.join("\n");
        fs.writeFileSync("./devs.txt", Buffer.from(devListStr), (err) => {
            if(err) {
                console.error(err);
                callback(false)
            }
        })
        callback(true);
    }
}