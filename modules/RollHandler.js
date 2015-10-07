//Functionality related to roll handling

exports.roll = function roll(times, dice, modifier, explodingRoll) {
    this.times = times || 1;
    this.dice = dice;
    this.modifier = modifier || 0;
    this.explodingRoll = explodingRoll || false;
    //this.rollType = rollType || "";
}

exports.parseRollString = function parseRollString(rollStr) {
    console.log(rollStr);
    var explodes = false;
    if (rollStr.indexOf('!') === (rollStr.length - 1)) {
        var explodes = true;
        rollStr = rollStr.slice(0, -1);
    }
    if (rollStr.indexOf('d') === -1) {
        return false;
    }
    var splitStr = rollStr.split('d');
    // console.log(splitStr);
    var firstPart = splitStr[0];
    var secondPart = rollStr.substring(firstPart.length + 1);
    
    times = parseInt(firstPart);
    
    if (times === NaN || times <= 0 || times > 100) {
        return false;
    }
    //no more than 100 due to abuse considerations
    //firstInt is a positive integer at this point
    console.log("times: " + times);
    
    var dice = NaN;
    var modifier = NaN;
    if (rollStr.indexOf('+') > 0) {
        splitStr = secondPart.split('+');
        if (splitStr.length > 2) {
            return false;
        }
        dice = parseInt(splitStr[0]);
        modifier = parseInt(splitStr[1]);
    } else if (rollStr.indexOf('-') > 0) {
        splitStr = secondPart.split('-');
        if (splitStr.length > 2) {
            return false;
        }
        dice = parseInt(splitStr[0]);
        modifier = -1 * parseInt(splitStr[1]);
    } else {
        dice = parseInt(secondPart);
        modifier = 0;
    }
    
    if (dice === NaN || modifier === NaN) {
        return false;
    }
    
    
    var newRoll = {};
    newRoll.times = times;
    newRoll.dice = dice;
    newRoll.modifier = modifier;
    newRoll.explodingRoll = explodes;
    
    console.log(newRoll);
    
    return newRoll;
};

exports.calculateRoll = function calculateRoll(roll) {
    var sum = 0;
    var roll_record = "";
    for (var i = 0; i < roll.times; i++) {
        var temp = Math.floor(Math.random() * roll.dice) + 1;
        if (roll.explodingRoll === true && temp === roll.dice) roll.times++; //Exploding die roll		
        sum += temp;
        roll_record = roll_record.concat(temp, " ");
    };
    sum += roll.modifier;
    var details = "";
    details = details.concat(roll_record, "(", roll.modifier, ") = ", sum);
    rollResult = {
        "details" : details,
        "sum" : sum
    };
    return rollResult;
}

exports.calculateWodRoll = function calculateWodRoll(times, difficulty) {
    
    var success = 0;
    var failure = 0;
    for (var i = 0; i < times; i++) {
        var rollResult = (Math.floor(Math.random() * 10) + 1);
        if (rollResult === 1) {
            failure++;
        }
        else if (rollResult >= difficulty) {
            success++;
            if (rollResult === 10) {
                times++;
            }
        }
    };
    var result = {};
    result.success = success;
    result.failure = failure;
    return result;
}