//Functionality related to character creation

exports.character = function character(charName, charCampaign, charSheet) {
    
    this.charName = charName;
    this.charCampaign = charCampaign || "";
    this.charSheet = charSheet || "";
};

exports.parseCharStr = function parseCharStr(charStr) {
    try {
        console.log(charStr);
        if (charStr == false) return false;
        var quote_re = /"(.*?)"/g;
        var link_re = /(https?:\/\/[^\s]+)/g;
        var parseCharClean = "";
        var parseChar = charStr.match(quote_re);
        if (parseChar !== null) {
            parseCharClean = parseChar.map(function (x) { return x.replace(/"/g, ''); });
        }
        var parseSheet = charStr.match(link_re);
        if (parseChar === []) return false;
        var newChar = new exports.character(parseChar[0], parseChar[1], parseSheet[0]);
        console.log(parseChar);
        console.log(newChar);
        return newChar;
    }
    catch (err) {
        console.log("Error during parseCharStr: " + err);
        return false;
    }

};