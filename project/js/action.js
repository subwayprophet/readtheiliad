var characters = [];
var people = [];
var authors = [];
var gods = [];
var actions = [];
var passages = [];

const LIFESTATE_ALIVE = 'alive';
const LIFESTATE_DEAD = 'dead';
const LIFESTATE_DEFAULT = LIFESTATE_ALIVE;

const EMOTION_MENIS = Infinity;
const EMOTION_MAX = 1000;
const EMOTION_RAGE = 100;
const EMOTION_SMALL = 10;
const EMOTION_REALITYDISTANCE = 1;
const EMOTION_MIDDLEFINGER = 80;
const EMOTIONAL_STATE_DEFAULT = {
	'happiness' : 0,
	'rage'      : 0
};

const RELATIONSHIP_TEMPLATE = {
	'friends' : [], //how to clone safely??
	'enemies' : []
};

const LOCATION_UNDERWORLD = 'Hades';
const LOCATION_DEFAULT = 'unknown'

class Person {
	constructor(name, work, description, lifeState, deathYear) {
		this.name = name;
		this.work = work;
		this.description = description;
		this.currentLocation = LOCATION_DEFAULT;
		this.lifeState = lifeState ? lifeState : LIFESTATE_DEFAULT;
		this.deathYear = deathYear;
		this.lifeState = this.isDead() ? LIFESTATE_DEAD : LIFESTATE_ALIVE;
		this.mentionedInPassages = [];
		this.relationships = {
			'friends' : [], //how to clone children?
			'enemies' : []
		};
		this.emotionalState = Object.assign({},EMOTIONAL_STATE_DEFAULT); //clone!
		this.thingsOwned = [];
		people.push(this);
	}

	get mentionedInWorks() {
		let works = [];
		for(let i=0; i<this.mentionedInPassages.length; i++) {
			let thisPassage = this.mentionedInPassages[i];
			works.push(thisPassage.work);
		}
		return works;
	}

	get friends() {
		return this.relationships['friends'];
	}
	get enemies() {
		return this.relationships['enemies'];
	}

	get netWorth() {
		let p = this;
		let netWorth = 0;
		for(let i=0; i<p.thingsOwned.length; i++) {
			let thingOwned = p.thingsOwned[i];
			if(thingOwned.value) { netWorth += thingOwned.value; }
		}
		return netWorth;
	}

	speak(speech) {
		utter(this.name + ' says ' + speech);
	}

	accept(thing, giver) {
		var p = this;
		let success = true; //sometimes people reject gifts


		if(!p.isAcceptableGiver(giver, thing)) {
			p.enrage(EMOTION_SMALL);
			utter(p.name + ' rejects the offer of ' + thing.name + ' from that jerk ' + giver.name + '.');
			success = false;
		} else {
			utter(p.name + ' scoffs at this pathetic mortal possession of a ' + thing.name + ' from the lowly ' + giver.name + ".");
			p.thingsOwned.push(thing);
			giver.thingsOwned = giver.thingsOwned.filter(function(thingOwned) {
				return thingOwned !== thing;
			});
			success = true;
		}

		return success;
	}
	isAcceptableGiver(giver, gift) {
		let p = this;
		if(p.enemies.indexOf(giver) !== -1) { //dont accept gifts from enemies?
			return false;
		}
		return true;
	}
	give(thing, recipient) {
		var p = this;
		(new Give(p,recipient,thing,p.name + ' offers ' + thing.name + ' to ' +  recipient.name)).enact();
	}

	giveTheFinger(mockee,adjective) {
		var p = this;
		(new Givethefinger(p,mockee,adjective)).enact();
		p.give(Middlefinger,mockee);
	}

	tryToKill(victim, deathYear) {
		var p = this;
		(new Kill(p,victim,p.name + ' tries to kill ' + victim.name)).enact();
	}

	die(deathYear, killer) {
		let p = this;
		let success = true;
		p.lifeState = LIFESTATE_DEAD;
		p.deathYear = deathYear ? deathYear : currentYear;
		utter(p.name + ' died in year ' + p.deathYear + '.');
		p.goToLocation(LOCATION_UNDERWORLD);
		if(p.friends) {
			for(let i=0; i<p.friends.length; i++) {
				let thisFriend = p.friends[i];
				thisFriend.sadden(EMOTION_MAX);
				thisFriend.enrage(EMOTION_RAGE);
				if(killer) {
					thisFriend.speak('I HATE YOU ' + killer.name + ' FOR KILLING ' + p.name + '!!!!!');
					thisFriend.becomeenemy(killer);
				}
			}
		}
		return success;
	}

	fume(adjective) {
		var p = this;
		if(!adjective) { adjective = 'Bachannalian'}
		p.enrage(80);
		utter(p.name + " fumes.");
		p.speak("\"You " + adjective + " bastard son of a bitch scheisse.\"");


	}

	goToLocation(place) {
		this.currentLocation = place;
	}

	sadden(amountToSadden) {
		this.emotionalState['happiness']  -= amountToSadden;
		utter(this.name + ' saddens.');
	}
	happyfy(amountToHappyfy) {
		this.emotionalState['happiness']  += amountToHappyfy;
		utter(this.name + ' gets happier.');
	}
	enrage(amountToEnrage) {
		this.emotionalState['rage'] += amountToEnrage;
		utter(this.name + ' is enraged.');
	}

	befriend(friend) {
		this.friends.push(friend);
		friend.friends.push(this);
	}

	becomeenemy(enemy) {
		this.enemies.push(enemy);
		// enemy.enemies.push(this); //always reciprocal?
	}

	isDead() {
		return  this.lifeState === LIFESTATE_DEAD
				|| this.deathYear < currentYear;
	}

	payAttentionTo(actionType, callback) {
		var p = this;
		window.addEventListener(actionType,function(event) {
			utter(p.name + ' ' + 'notices that ' +  event.detail.description);
			callback && callback();
		});
	}
}

class Character extends Person {
	constructor(name, job, description, firstInText) {
		super(name, job, description);
		this.firstInText = firstInText;
		characters.push(this);
	}
}

class Author extends Person {
	constructor(name, job, description, birthPlace, knownForAuthoring, deathYear) {
		super(name, job, description, undefined, deathYear);
		this.birthPlace = birthPlace;
		this.knownForAuthoring = knownForAuthoring;
		this.payAttentionTo('kill');
		this.payAttentionTo('die');
		this.payAttentionTo('give');
		authors.push(this);
	}

	write(text) {
		super.speak(text);
		alert(text);
	}

	payAttentionTo(actionType) {
		var p = this;
		super.payAttentionTo(actionType, function() {
			switch(actionType) {
				case 'die' :
					p.sadden(EMOTION_SMALL);
					break;
				case 'kill' :
					p.enrage(EMOTION_REALITYDISTANCE);
					break;
				case 'give' :
					p.happyfy(EMOTION_SMALL);
					utter(p.name + ' smiles at such an act of generosity.');
			}
		});
	}

	// enrage() {}; //authors don't feel rage?
}

class God extends Person {
	constructor(name, job, description, inChargeOf) {
		super(name, job, description);
		this.inChargeOf = inChargeOf;
		this.emotionalState = {
			'happiness'     : 1000, //makaroi
			'cackling_glee' : 0
		};
		this.payAttentionTo('kill');
		gods.push(this);
	}
	die(deathYear, killer) {
		let success = false;
		deathYear = deathYear ? deathYear : currentYear;
		utter(this.name + ' laughs at ' + killer.name + '\'s attempt to kill him in the year ' + deathYear + '. ' + this.name + ' is a god and therefore cannot die!!');
		return success;
	}

	payAttentionTo(actionType, callback) {
		var p = this;
		super.payAttentionTo(actionType, function(event){
			switch(actionType) {
				case 'kill' :
					p.gloat(EMOTION_SMALL);
			}
		});
	}

	gloat() {
		var p = this;
		p.emotionalState['cackling_glee'] += EMOTION_SMALL;
		utter(p.name + ' cackles with gloating glee.')
	}
}

class Thing {
	constructor(name,type,value, owner) {
		this.name = name;
		this.type = type;
		this.value = value; //also should be its own type? but for now just a number
		if(owner) { owner.thingsOwned.push(this); }
	}
}

class Text {
	constructor(title, author) {
		this.title = title;
		this.author = author;
		this.passages = [];
		this.characters = [];
	}


}

class Passage {
	constructor(work,citation,charactersMentioned,actionsPerformed,literalText) {
		this.work = work;
		this.citation = citation;
		this.charactersMentioned = charactersMentioned;
		work.passages.push(this);
		work.characters = work.characters.concat(this.charactersMentioned);
		this.relateToCharacters();
		this.actionsPerformed = actionsPerformed;
		this.literalText = literalText;
		passages.push(this);
	}

	relateToCharacters() {
		for(let i=0; i<this.charactersMentioned.length; i++) {
			var thisChar = this.charactersMentioned[i];
			thisChar.mentionedInPassages.push(this);
		}
	}

	realize() {
		let p = this;
		if(p.literalText){ utter(p.literalText); }

		if(!p.actionsPerformed) {return;}
		for(let i=0; i<p.actionsPerformed.length; i++) {
			let thisAction = p.actionsPerformed[i];
			utter('In ' + p.citation + ', ' + thisAction.description);
			thisAction.enact();
		}
		utter('____________________________________________________________')
	}
}

class Action {
	constructor(agent,patient,type,description,cause) {
		this.agent = agent;
		this.patient = patient;
		this.type = type;
		this.description = description;
		this.cause = cause; //another action? js isn't typed but..do we need Causes modeled?
		actions.push(this);
	}

	enact(correlatedActions) {
		//sometimes actions go with other actions (for instance, logically: 'kill' and 'die'; or causally: 'exhort' and 'attack')
		if(correlatedActions) {
			for(let i=0; i<correlatedActions.length; i++) {
				let thisCorrelatedAction = correlatedActions[i];
				thisCorrelatedAction.enact();
			}
		}
		//any time an action occurs, fire an event so that anyone listening knows about it
		var wrappingEvent = (new Event(this));
		wrappingEvent.happen(wrappingEvent.action.success);
	}
}

class Kill extends Action {
	constructor(agent,patient,description) {
		super(agent,patient,'kill',description);
	}

	enact() {
		var a = this;
		// a.agent.kill(a.patient);
		var wrappingEvent = (new Event(a));
		wrappingEvent.happen(true); //???? :(
		var correspondingDeaths = [(new Die(a.patient,a.agent,a))];
		super.enact(correspondingDeaths);
	}
}

class Die extends Action {
	constructor(deceased, agent, cause) {
		super(null,deceased,'die',deceased.name + ' dies. ',cause);
		this.success = deceased.die(null,agent);
	}
}

class Givethefinger extends Action {
	constructor(mocker,mockee,adjective){
		super(mocker,mockee,"insult");
		mockee.fume(adjective);
	}
}

class Give extends Action {
	constructor(giver,recipient,gift,description,timestamp) {
		super(giver,recipient,'give',description);
		this.giver = giver;
		this.gift = gift;
		this.recipient = recipient;
		this.success = this.recipient.accept(this.gift,this.giver);
	}
}

class Event {
	constructor(action,timestamp) {
		this.action = action;
		this.timestamp = timestamp;
	}
	happen(success) {
		if(success) {
			utter('......and then......')
			var eventHappened = new CustomEvent(this.action.type, {
				detail: this.action,
				success: success
			});
			window.dispatchEvent(eventHappened);
		}
	}
}


//define characters
var Achilles = new Character('Achilles', 'warrior','Son of Peleus','Iliad');
Achilles.enrage = function() { //Achilles is a special case!
	this.emotionalState['rage'] += EMOTION_MENIS;
};
var Patroclus = new Character('Patroclus', 'warrior','hetairos of Achilles','Iliad');

var Zog = new Character("Zog",'King of the Albanians',"Father of Albania", 'Zogiad');

var AwesomeArmor1 = new Thing('Achilles\' awesome first armor','armor',1000,Achilles);

var Peleus = new Character('Peleus', 'king','Father of Achilles','Iliad');
var Hector = new Character('Hector', 'warrior','Son of Priam','Iliad');
var TrojanArmor1 = new Thing('Hector\'s sweet armor','armor',800,Hector);
var BMW = new Thing("BMW","car",3000,Zog);
var Middlefinger = new Thing("Middle Finger","gesture",5,Achilles);


var Priam = new Character('Priam', 'king','king of Troy, father of Hector','Iliad');
var Agamemnon = new Character('Agamemnon', 'king','king of Argos, giant asshole','Iliad');
var Homer = new Author('Homer', 'bard','blind poet','Ceos','Iliad and Odyssey',-700);

var Zeus = new God('Zeus','king of the gods','child of Kronos, husband of Hera','sky, thunder, lightning');
//all gods cackle with glee at killing, but for this story zeus in particular pays attention to deaths, because his boule (from the kypria) is to thin the human population
Zeus.payAttentionTo = function(actionType, callback) {
	var p = this;
	window.addEventListener(actionType,function(event) {
		utter(p.name + ' ' + 'that jerk notices that ' +  event.detail.description);
		switch(actionType) {
			case 'kill' :
				p.gloat(EMOTION_SMALL);
				break;
			case 'die' :
				p.happyfy(EMOTION_REALITYDISTANCE);
				utter('Zeus is extra happy because his plan is being fulfilled.');
		}
		callback && callback();
	});
};
Zeus.payAttentionTo('die');

var Hades = new God('Hades','king of the underworld','the invisible','the underworld');

//define actions
var HectorKillPatroclus = new Kill(Hector,Patroclus,'Hector kills Patroclus after Patroclus kills a lot of Trojans');
var AchillesKillsHector = new Kill(Achilles,Hector,'Achilles slaughters Hector after chasing him around a lot');
var AchillesTriesToKillZeus = new Kill(Achilles,Zeus,'Achilles tries to kill Zeus cuz he is mad APOCRYPHAL???');
var HectorBegsForMercy = new Action(Hector,Achilles,'begs','Hector begs Achilles not to kill him.');

//define texts
var Iliad = new Text('Iliad',Homer);

//define passages
var Iliad1_1 = new Passage(Iliad,'Iliad 1.1',[Achilles,Peleus],[],'μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος');
var Iliad1_3 = new Passage(Iliad,'Iliad 1.3',[Hades]);
var Iliad_16something = new Passage(Iliad,'Iliad 16.something',[Hector,Patroclus],[HectorKillPatroclus]);
var Iliad_22something = new Passage(Iliad,'Iliad 22.something',[Achilles,Hector],[HectorBegsForMercy,AchillesKillsHector]);
var Iliad_22something = new Passage(Iliad,'Iliad 24.haha',[Achilles,Zeus],[AchillesTriesToKillZeus]);

var Odyssey = new Text('Odyssey',Homer);
var Odyssey_something = new Passage(Odyssey,'Odyssey blah',[Achilles]);

// function makeTheGodsLaugh() {
// 	for(let i=0; i<gods.length; i++) {
// 		let thisGod = gods[i];
// 		utter(thisGod.name + ' laughs.');
// 		thisGod.gloat();
// 	}
// }

//entry point!!!!!!
function readTheIliad() {
	currentYear = -1200;
	initRelationships();
	window.addEventListener('doneSinging',function(blah) {
		utter('At the end of the Iliad, people are in this state: ');

		for(let i=0; i<people.length; i++) {
			let person = people[i];
			let personStateString = generatePersonStateString(person);
			utter(personStateString);
		}

		function generatePersonStateString(person) {
			let stateString = '';
			let emotionString = 'Their feelings are: ';
			let friendsString = '';
			let enemiesString = '';

			let emotions = Object.keys(person.emotionalState);
			for (let i = 0; i < emotions.length; i++) {
				let separatorString = i === emotions.length-1 ? '.' : ',';
				separatorString += ' ';
				let thisEmotion = emotions[i];
				let thisEmoStr = thisEmotion + ': ' + person.emotionalState[thisEmotion] + separatorString;
				emotionString += thisEmoStr;
			}

			let friends = Object.keys(person.friends);
			if(friends.length>0) {
				friendsString += 'Their friends are: ';
				for (let i = 0; i < friends.length; i++) {
					let separatorString = i === friends.length-1 ? '.' : ',';
					separatorString += ' ';
					let thisFriend = friends[i];
					let thisFriendStr = person.friends[thisFriend].name + separatorString;
					friendsString += thisFriendStr;
				}
			}

			let enemies = Object.keys(person.enemies);
			if(enemies.length>0) {
				enemiesString += 'Their enemies are: ';
				for (let i = 0; i < enemies.length; i++) {
					let separatorString = i === enemies.length-1 ? '.' : ',';
					separatorString += ' ';
					let thisEnemy = enemies[i];
					let thisEnemyStr = person.enemies[thisEnemy].name + separatorString;
					enemiesString += thisEnemyStr;
				}
			}

			stateString += person.name + ' is currently ' + person.lifeState + '. ' + emotionString + friendsString + enemiesString;
			return stateString;
		}

	});
	realizePassages(passages);

}

function initRelationships() {
	//TODO: put in db or something
	Achilles.befriend(Patroclus);
	Priam.befriend(Hector);
	// Hector.befriend(Homer); //haha
	// Homer.befriend(Achilles);
	// Homer.befriend(Patroclus);
}
function realizePassages(passagesToRealize) {
	utter('SING!!!!');
	for(let i=0; i<passagesToRealize.length; i++) {
		let thisPassage = passagesToRealize[i];
		setTimeout(function() {
			thisPassage.realize();
			if(i===passagesToRealize.length-1) {
				var doneSinging = new CustomEvent('doneSinging');
				window.dispatchEvent(doneSinging);
			}
		},i*500);
	}
}

function utter(thingToSay) {
	console.log(thingToSay);
	if(document.getElementById('narrativeStream')) {
		var utteredLine = document.createElement("p");
		var utteredSpeech = document.createTextNode(thingToSay);
		utteredLine.appendChild(utteredSpeech);
		var narrativeStreamContainer = document.getElementById('narrativeStream');
		narrativeStreamContainer.appendChild(utteredLine);
	}
}


var currentYear = (new Date()).getFullYear();
var currentCharacter = Homer;
var currentLine = 1;

function be(character) {
	currentCharacter = character;
}

function act(command) {
	eval(currentCharacter.name + '.' + command);
}