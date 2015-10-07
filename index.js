var config = require('./config/config'),
mongoose = require('./config/mongoose'),
Bot = require('node-telegram-bot');
RollHandler = require('./modules/RollHandler');
CharacterHandler = require('./modules/CharacterHandler')
var db = mongoose();

//Functionality related to Telegram bot and message parsing

var bot = new Bot({
	token: config.token
})
.on('message', function (message) {
	console.log(message);
	var User = db.model('User');
	var Roll = db.model('Roll');
    var WodRoll = db.model('WodRoll');
    var Character = db.model('Character');

	if(message.hasOwnProperty("text"))
	{
        var cmdStr = message.text;
        var splitStr = message.text.split(" ");
        
        //Handling character commands first, as they can't be split properly using space as a separator
        
        if (splitStr[0] === "/savechar") {
            var parsedMessage = CharacterHandler.parseCharStr(cmdStr);
            if (parsedMessage === false) {
                bot.sendMessage({ "chat_id" : message.chat.id , "reply_to_message_id" : message.message_id , "text" : "Invalid save format. The expected format is \"/savechar <character name (in double quotes)> <character campaign (in double quotes)> <URL to character sheet>\"" }, function (nodifiedPromise) { });
                return;
            }

        }
        else if (splitStr[0] === "/char") {

        }
        else if (splitStr[0] === "/deletechar") {

        }

        //console.log("cmdStr is: " + cmdStr);

		if(splitStr.length === 1)
		{
			if(splitStr[0] === "/register")
			{
				var userRegisterCallback = function(err,user){
					// var User = db.model('User');
					if(err) 
					{
						console.log("error at /register, User.findOne");
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						User.create({"id": message.from.id}, function(err){
							console.log("error at /register, User.findOne, User.create");
							console.log(err);
							bot.sendMessage({"chat_id" : message.chat.id , "text" : err},function(nodifiedPromise){});
							return
						});
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "User " + message.from.username + " is registered"},function(nodifiedPromise){});
					} else {
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "User " + message.from.username + " was already registered"},function(nodifiedPromise){});
					}
				};
				userRegisterCallback.message = message;
				User.findOne({"id": message.from.id}, userRegisterCallback);
			}
			else if (splitStr[0] === "/help")
			{
				var msgText = "/help - show this message\n/register - register to start using the bot and save your custom rolls\n↳usage: \"/register\"\n\n===== d20 Rolls =====\n\n/qroll - quick roll without saving a custom roll\n↳usage: \"/qroll 1d4+1\"\n\n/save - save a custom roll\n↳usage \"/save magicmissile 1d4+1\"\n\n/roll - roll a previously saved custom roll, optionally repeat\n↳usage: \"/roll magicmissile\"\n↳usage: \"/roll magicmissile 5\"\n\n/showrolls - show saved rolls\n↳usage: \"/showrolls\"\n\n/delete - delete a saved roll\n↳usage: \"/delete magicmissile\"\n\n===== World of Darkness Rolls =====\n\n/wodsave - save a custom roll, with dice pool and difficulty, in that order\n↳usage: \"/wodsave attack 6 5\"\n\n/wod - roll a previously saved custom roll or an unsaved roll\n↳usage: \"/wod attack\"\n↳usage: \"/wod 6 5\"\n\n/wodshow - show saved rolls\n↳usage: \"/wodshow\"\n\n/woddelete - delete a saved roll\n↳usage: \"/woddelete attack\"";
				bot.sendMessage({"chat_id" : message.chat.id , "text" : msgText});
			}
			else if (splitStr[0] === "/showrolls")
			{
				var userCallback = function(err,user)
				{
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					} else 
					{
					//found user, now display rolls
						var rollCallback = function(err,rolls)
						{
							if(err) 
							{
								console.log(err);
								bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
								return
							}
							if(rolls === null)
							{
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "No saved rolls found. Please save a roll first with \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
							} 
							else 
							{
								console.log('found rolls');
								var msgText = 'Saved rolls for ' + message.from.username + '\n';
								rolls.forEach(function(val,ind,arr){
									var modifierSign = '+';
									if(val.modifier < 0) modifierSign = '';
									msgText += val.name + " | " + val.times + "d" + val.dice +  modifierSign + val.modifier + '\n';
									if(val.explodingRoll) msgText += '(Explodes on a ' + val.dice + ')\n';
								});
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : msgText },function(nodifiedPromise){});
							}
						}
						rollCallback.message = message;
						Roll.find({"id": message.from.id},rollCallback);
					}
				}
				userCallback.message = message;
				User.findOne({"id": message.from.id}, userCallback);
            }
            else if (splitStr[0] === "/showchars") {
                var userCallback = function (err, user) {
                    if (err) {
                        console.log(err);
                        bot.sendMessage({ "chat_id" : message.chat.id , "text" : err.toString() }, function (nodifiedPromise) { });
                        return
                    }
                    if (user === null) {
                        bot.sendMessage({ "chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)" });
                    } else {
                        //found user, now display its characters
                        var charCallback = function (err, chars) {
                            if (err) {
                                console.log(err);
                                bot.sendMessage({ "chat_id" : message.chat.id , "text" : err.toString() }, function (nodifiedPromise) { });
                                return
                            }
                            if (chars === null) {
                                bot.sendMessage({ "chat_id" : message.chat.id , "reply_to_message_id" : message.message_id , "text" : "No saved characters found. Please save a character first with \"/savechar <character name (enclosed in double quotes)> <campaign name (enclosed in double quotes)> <URL to character sheet> For example: \"/charsave \"Belinda Norwood\" \"The 7th Guest\" http://link.to.image/char1.png \"" }, function (nodifiedPromise) { });
                            } 
                            else {
                                console.log('found characters');
                                var msgText = 'Saved characters for ' + message.from.username + '\n';
                                chars.forEach(function (val, ind, arr) {
                                    //TODO: Write the function to display characters
                                });
                                bot.sendMessage({ "chat_id" : message.chat.id , "reply_to_message_id" : message.message_id , "text" : msgText }, function (nodifiedPromise) { });
                            }
                        }
                        charCallback.message = message;
                        Character.find({ "id": message.from.id }, charCallback);
                    }
                }
                userCallback.message = message;
                User.findOne({ "id": message.from.id }, userCallback);
            }
			else if (splitStr[0] === "/showwod")
			{
				var userCallback = function(err,user)
				{
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					} else 
					{
					//found user, now display rolls
						var rollCallback = function(err,rolls)
						{
							if(err) 
							{
								console.log(err);
								bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
								return
							}
							if(rolls === null)
							{
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "No saved rolls found. Please save a roll first with \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
							} 
							else 
							{
								console.log('found rolls');
								var msgText = 'Saved WoD rolls for ' + message.from.username + '\n';
								rolls.forEach(function(val,ind,arr){
									msgText += val.name + " | Dice Pool: " + val.times + " | Difficulty: " + val.difficulty +'\n';
								});
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : msgText },function(nodifiedPromise){});
							}
						}
						rollCallback.message = message;
						WodRoll.find({"id": message.from.id},rollCallback);
					}
				}
				userCallback.message = message;
				User.findOne({"id": message.from.id}, userCallback);
			}
		}
		else if (splitStr.length === 2)
		{ 
			if(splitStr[0] === "/roll")
			{
				var key = splitStr[1];	
				var userCallback = function(err,user){
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					} 
					else 
					{
						//found user, now find roll if exists
						var rollCallback = function(err,roll){
							if(err) 
							{
								console.log(err);
								bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
								return
							}
							if(roll === null)
							{
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Unsaved custom roll. Please save first with \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
							} else 
							{
								var newRoll = {};
								newRoll.times = roll.times;
								newRoll.dice = roll.dice;
								newRoll.modifier = roll.modifier;
								newRoll.explodingRoll = roll.explodingRoll;
								result = RollHandler.calculateRoll(newRoll);
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : message.from.username + " | " + key + " | " + result.details },function(nodifiedPromise){});
							}

						}
						rollCallback.message = message;
						rollCallback.key = key;
						Roll.findOne({"id": message.from.id , "name" : key},rollCallback);
					}
				};
				userCallback.message = message;
				userCallback.key = key;
				User.findOne({"id": message.from.id}, userCallback);
			} 
			else if(splitStr[0] === "/qroll")
			{
				var roll = RollHandler.parseRollString(splitStr[1]);
				if(roll === false){
					bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Invalid roll format or unsaved custom roll. The expected format is \"/qroll <integer>d<integer>{+,-}<integer>\", for example: \"/qroll 2d12+4\""},function(nodifiedPromise){});
					return
				}
				var result = RollHandler.calculateRoll(roll);
				bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : message.from.username + " | " + splitStr[1] + " | " + result.details },function(nodifiedPromise){});
			}
			else if(splitStr[0] === "/wod")
			{
				var key = splitStr[1];
				var userCallback = function(err,user){
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					} 
					else 
					{
						//found user, now find roll if exists
						var rollCallback = function(err,wodroll){
							if(err) 
							{
								console.log(err);
								bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
								return
							}
							if(wodroll === null)
							{
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Unsaved custom roll. Please save first with \"/wodsave <roll name> <dice pool> <difficulty>\", for example: \"/save attack 6 5\""},function(nodifiedPromise){});
							} 
							else 
							{
								result = RollHandler.calculateWodRoll(wodroll.times,wodroll.difficulty);
								console.log(result);
								var msgText = message.from.username + " | " + key + " | " + (result.success-result.failure) + '\n';
								console.log(msgText);
								msgText += 'Success: ' + result.success + ' | Dramatic Failure: ' + result.failure;
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" :msgText },function(nodifiedPromise){});
							}

						}
						rollCallback.message = message;
						rollCallback.key = key;
						WodRoll.findOne({"id": message.from.id , "name" : key},rollCallback);
					}
				};
				userCallback.message = message;
				userCallback.key = key;
				User.findOne({"id": message.from.id}, userCallback);
			}
			else if(splitStr[0] === "/delete")
			{
				var key = splitStr[1];	
				var userCallback = function(err,user){
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					} 
					else 
					{
						//found user, now find roll if exists
						var deleteCallback = function(err,roll){
							if(err) 
							{
								console.log(err);
								bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
								return
							}
							if(roll === null)
							{
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Unsaved custom roll. Please save first with \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
							} else 
							{
								var msgText = key + " removed for " + message.from.username;
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : msgText},function(nodifiedPromise){});
							}

						}
						deleteCallback.message = message;
						deleteCallback.key = key;
						Roll.findOne({"id": message.from.id , "name" : key}).remove(deleteCallback);
					}
				};
				userCallback.message = message;
				userCallback.key = key;
				User.findOne({"id": message.from.id}, userCallback);
			}
			else if(splitStr[0] === "/woddelete")
			{
				var key = splitStr[1];	
				var userCallback = function(err,user){
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					} 
					else 
					{
						//found user, now find roll if exists
						var deleteCallback = function(err,roll){
							if(err) 
							{
								console.log(err);
								bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
								return
							}
							if(roll === null)
							{
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Unsaved custom roll. Please save first with \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
							} else 
							{
								var msgText = key + " removed for " + message.from.username;
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : msgText},function(nodifiedPromise){});
							}

						}
						deleteCallback.message = message;
						deleteCallback.key = key;
						WodRoll.findOne({"id": message.from.id , "name" : key}).remove(deleteCallback);
					}
				};
				userCallback.message = message;
				userCallback.key = key;
				User.findOne({"id": message.from.id}, userCallback);
            }
		}
		else if (splitStr.length === 3)
		{
			if(splitStr[0] === "/save")
			{
				var key = splitStr[1];
				var roll = RollHandler.parseRollString(splitStr[2]);

				if(roll === false)
				{
					bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Invalid save format. The expected format is \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
					return
				}

				var saveCallback = function(err,user){
					// var User = db.model('User');
					if(err) 
					{
						console.log(err);
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Unknown error" },function(nodifiedPromise){});
						return
					}
					if(user === null)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
					}
					else 
					{
						if(roll === false)
						{
							bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Invalid roll format. The expected format is \"<integer>d<integer>{+,-}<integer>\", for example: \"2d12+4\""},function(nodifiedPromise){});
						} 
						else
						{	
							Roll.update({"id": user.id, "name": key}, {$set: {"dice": roll.dice, "times": roll.times, "modifier": roll.modifier, "explodingRoll": roll.explodingRoll}}, {"upsert": true, "new": true}, function(err,result){
								console.log(result);
								console.log('recorded roll');
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : message.from.username + " | " + key + " | saved"},function(nodifiedPromise){});							
							});
						}
					}
				};
				saveCallback.message = message;
				saveCallback.roll = roll;
				saveCallback.key = key;
				// saveCallback.rollString = splitStr[2];
				User.findOne({"id": message.from.id}, saveCallback);
			}
			else if(splitStr[0] === "/roll")
			{	
				console.log('rolling n times');
				var key = splitStr[1];
				var nTimes = parseInt(splitStr[2]);
				if( nTimes > 0)
				{
					console.log('rolling ' + key + ' ' + nTimes);
					if(nTimes > 100)
					{
						bot.sendMessage({"chat_id" : message.chat.id , "text" : "I can repeat the roll to a maximum of 100 times at a time. Please try a smaller number."},function(nodifiedPromise){});
						return
					}
					var key = splitStr[1];	
					var userCallback = function(err,user){
						if(err) 
						{
							console.log(err);
							bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
							return
						}
						if(user === null)
						{
							bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
						} else 
						{
							//found user, now find roll if exists
							var rollCallback = function(err,roll){
								if(err) 
								{
									console.log(err);
									bot.sendMessage({"chat_id" : message.chat.id , "text" : err.toString()},function(nodifiedPromise){});
									return
								}
								if(roll === null)
								{
									bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : "Unsaved custom roll. Please save first with \"/save <roll name> <integer>d<integer>{+,-}<integer>\", for example: \"/save magicmissile 1d4+1\""},function(nodifiedPromise){});
								} else 
								{
									var newRoll = {};
									newRoll.times = roll.times;
									newRoll.dice = roll.dice;
									newRoll.modifier = roll.modifier;
									newRoll.explodingRoll = roll.explodingRoll;
									var msgText = 'Rolling ' + key + ' ' + nTimes + ' times for ' + message.from.username + '\n';
									var sum = 0;
									for (var i = 0; i < nTimes; i++) {
										var rollResult = RollHandler.calculateRoll(newRoll);
										msgText += rollResult.details + " | ";
										sum += rollResult.sum;
									};
									msgText += '\n' + 'Sum of rolls: ' + sum;
									bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : msgText},function(nodifiedPromise){});
								}
							};
							rollCallback.message = message;
							rollCallback.key = key;
							Roll.findOne({"id": message.from.id , "name" : key},rollCallback);
						}
					};
					userCallback.message = message;
					userCallback.key = key;
					User.findOne({"id": message.from.id}, userCallback);
				}
				else
				{
					var msgText = "Invalid command for repeating saved roll. Try \"/roll <rollname> <integer>\" with <integer> smaller than 100 and a previously saved roll name. For example: \"/roll magicmissile 5\"";
					bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : msgText},function(nodifiedPromise){});
				}
			}
			else if(splitStr[0] === "/wod")
			{
				var times = parseInt(splitStr[1]);
				var difficulty = parseInt(splitStr[2]);

				if(times > 0 && times <= 100 && difficulty > 0 && difficulty <= 10)
				{
					result = RollHandler.calculateWodRoll(times,difficulty);
					console.log(result);
					var msgText = message.from.username + " | " + times + " dice at difficulty " + difficulty + " | Result: " + (result.success-result.failure) + '\n';
					console.log(msgText);
					msgText += 'Success: ' + result.success + ' | Dramatic Failure: ' + result.failure;
					bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" :msgText },function(nodifiedPromise){});
				} 
				else
				{
					var msgText = 'Invalid WoD quick roll format. Correct format is \"/wod <dice pool> <difficulty>\", for example, \"/wod 6 5\"';
					bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" :msgText },function(nodifiedPromise){});
				}
			}
			// else
			// {
			// 	bot.sendMessage({"chat_id" : message.chat.id , "text" : "Unknown request. Try /help for options"});
			// }
		}
		else if (splitStr.length === 4)
		{
			if(splitStr[0] === "/wodsave")
			{
				var key = splitStr[1];
				var times = parseInt(splitStr[2]);
				var difficulty = parseInt(splitStr[3]);

				if(key !== null && key !== undefined && times > 0 && times <= 100 && difficulty > 0 && difficulty <= 10)
				{
					var saveCallback = function(err,user){
						// var User = db.model('User');
						if(err) 
						{
							console.log(err);
							bot.sendMessage({"chat_id" : message.chat.id , "text" : "Unknown error" },function(nodifiedPromise){});
							return
						}
						if(user === null)
						{
							bot.sendMessage({"chat_id" : message.chat.id , "text" : "Please register first by typing \"/register\" (without the quotes)"});
						}
						else 
						{
							WodRoll.update({"id": user.id, "name": key}, {$set: {"times": times, "difficulty": difficulty}}, {"upsert": true, "new": true}, function(err,result){
								console.log(result);
								console.log('recorded wod roll');
								bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" : message.from.username + " | " + key + " | saved"},function(nodifiedPromise){});							
							});
						}
					};
					saveCallback.message = message;
					saveCallback.times = times;
					saveCallback.difficulty = difficulty;
					saveCallback.key = key;
					User.findOne({"id": message.from.id}, saveCallback);
				} else
				{
					var msgText = 'Invalid WoD roll format. Correct format is \"/wodsave <roll name> <dice pool> <difficulty>\", for example, \"/wodsave attack 6 5\"';
					bot.sendMessage({"chat_id" : message.chat.id , "reply_to_message_id" : message.message_id ,"text" :msgText },function(nodifiedPromise){});
				}
			}
		}
	}
}).start();