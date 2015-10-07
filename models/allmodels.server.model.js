var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var RollSchema = new Schema({
	id: Number,
	name: String,
	dice: Number,
	times: Number,
	modifier: Number,
	explodingRoll: Boolean
});

var CharacterSchema = new Schema({
    id: Number,
    name: String,
    campaign: String,
    sheet: String
});

var WodRollSchema = new Schema({
	id: Number,
	name: String,
	times: Number,
	difficulty: Number
});

var UserSchema = new Schema({
	id: Number,
    rolls: [RollSchema],
    characters: [CharacterSchema]
});



mongoose.model('User', UserSchema);
mongoose.model('Roll', RollSchema);
mongoose.model('WodRoll', WodRollSchema);
mongoose.model('Character', CharacterSchema);