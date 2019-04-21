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

var currentYear = (new Date()).getFullYear();

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

	speak(speech) {
		console.log(this.name + ' says ' + speech);
	}

	kill(victim, deathYear) {
		victim.die(deathYear, this);
	}

	die(deathYear, killer) {
		let p = this;
		p.lifeState = LIFESTATE_DEAD;
		p.deathYear = deathYear ? deathYear : currentYear;
		console.log(p.name + ' died in year ' + p.deathYear + '.');
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
		makeTheGodsLaugh();
	}

	goToLocation(place) {
		this.currentLocation = place;
	}

	sadden(amountToSadden) {
		this.emotionalState['happiness']  -= amountToSadden;
	}
	happyfy(amountToHappyfy) {
		this.emotionalState['happiness']  += amountToHappyfy;
	}
	enrage(amountToEnrage) {
		this.emotionalState['rage'] += amountToEnrage;
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
		authors.push(this);
	}

	write(text) {
		super.speak(text);
		alert(text);
	}

	enrage() {}; //authors don't feel rage?
}

class God extends Person {
	constructor(name, job, description, inChargeOf) {
		super(name, job, description);
		this.inChargeOf = inChargeOf;
		this.emotionalState = {
			'cackling_glee' : 0
		};
		gods.push(this);
	}
	die(deathYear) {
		console.log(this.name + ' laughs at your attempt to kill him in year ' + deathYear + '. ' + this.name + ' is a god and therefore cannot die!!');
	}
	gloat() {
		this.emotionalState['cackling_glee'] += EMOTION_SMALL;
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
	constructor(work,citation,charactersMentioned,actionsPerformed) {
		this.work = work;
		this.citation = citation;
		this.charactersMentioned = charactersMentioned;
		work.passages.push(this);
		work.characters = work.characters.concat(this.charactersMentioned);
		this.relateToCharacters();
		this.actionsPerformed = actionsPerformed;
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
		if(!p.actionsPerformed) {return;}

		for(let i=0; i<p.actionsPerformed.length; i++) {
			let thisAction = p.actionsPerformed[i];
			console.log('In ' + p.citation + ', ' + thisAction.description);
			thisAction.enact();
		}
	}
}

class Action {
	constructor(agent,patient,type,description) {
		this.agent = agent;
		this.patient = patient;
		this.type = type;
		this.description = description;
		actions.push(this);
	}

	enact() {
		console.log('.....and then.....');
	}
}

class Kill extends Action {
	constructor(agent,patient,description) {
		super(agent,patient,'kill',description);
	}

	enact() {
		this.agent.kill(this.patient);
		super.enact();
	}
}


//define characters
var Achilles = new Character('Achilles', 'warrior','Son of Peleus','Iliad');
Achilles.enrage = function() { //Achilles is a special case!
	this.emotionalState['rage'] += EMOTION_MENIS;
};

var Patroclus = new Character('Patroclus', 'warrior','hetairos of Achilles','Iliad');
var Peleus = new Character('Peleus', 'king','Father of Achilles','Iliad');
var Hector = new Character('Hector', 'warrior','Son of Priam','Iliad');
var Homer = new Author('Homer', 'bard','blind poet','Ceos','Iliad and Odyssey',-700);
var Zeus = new God('Zeus','king of the gods','child of Kronos, husband of Hera','sky, thunder, lightning');
var Hades = new God('Hades','king of the underworld','the invisible','the underworld');

//define actions
var HectorKillPatroclus = new Kill(Hector,Patroclus,'Hector kills Patroclus after Patroclus kills a lot of Trojans');
var AchillesKillsHector = new Kill(Achilles,Hector,'Achilles slaughters Hector after chasing him around a lot');
var HectorBegsForMercy = new Action(Hector,Achilles,'begs','Hector begs Achilles not to kill him.');

//define texts
var Iliad = new Text('Iliad',Homer);
//define passages
var Iliad1_1 = new Passage(Iliad,'Iliad 1.1',[Achilles,Peleus]);
var Iliad1_3 = new Passage(Iliad,'Iliad 1.3',[Hades]);

//define passages
var Iliad_16something = new Passage(Iliad,'Iliad 16.something',[Hector,Patroclus],[HectorKillPatroclus]);
var Iliad_22something = new Passage(Iliad,'Iliad 22.something',[Achilles,Hector],[HectorBegsForMercy,AchillesKillsHector]);

var Odyssey = new Text('Odyssey',Homer);
var Odyssey_something = new Passage(Odyssey,'Odyssey blah',[Achilles]);

function makeTheGodsLaugh() {
	for(let i=0; i<gods.length; i++) {
		let thisGod = gods[i];
		console.log(thisGod.name + ' laughs.');
		thisGod.gloat();
	}
}

//entry point!!!!!!
function readTheIliad() {
	currentYear = -1200;
	initRelationships();
	realizePassages(passages);
	console.log('At the end of the Iliad, people are in this state: ');
	for(let i=0; i<people.length; i++) {
		console.log(people[i]);
	}
}
function initRelationships() {
	//TODO: put in db or something
	Achilles.befriend(Patroclus);
	Hector.befriend(Homer); //haha
	Homer.befriend(Achilles);
	Homer.befriend(Patroclus);
}
function realizePassages(passagesToRealize) {
	console.log('SING!!!!');
	for(let i=0; i<passagesToRealize.length; i++) {
		let thisPassage = passagesToRealize[i];
		thisPassage.realize();
	}
}