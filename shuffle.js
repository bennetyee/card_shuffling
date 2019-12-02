#!/usr/bin/nodejs

var assert = require('assert');

// A new deck of cards are in ace, 2, 3, etc order when looking at the
// face, but are dealt from the back, so the "top" card of the deck is
// the last one and the "bottom" card is the first in the array
// representation (the first is the king of the last suit and the last
// is the ace of the first suit, in the case of an unshuffled deck).
function initialDeck(deckSize) {
    return [...Array(deckSize).keys()];
}

function isValidShuffle(deck) {
    var seen = Array(deck.length).fill(false);
    for (var i of [...Array(deck.length).keys()]) {
	if (deck[i] < 0 || deck.length <= deck[i] || deck[i] != Math.floor(deck[i])) {
	    return false;
	}
	if (seen[deck[i]]) {
	    return false;
	}
	seen[deck[i]] = true;
    }
    return true;
}

function positionStatistics(position, shuffler, deckSize, numSamples) {
    var counts = Array(deckSize).fill(0);
    for (var i = 0; i < numSamples; i++) {
	var d = shuffler(deckSize);
//	if (!isValidShuffle(d)) {
//	    console.log(d);
//	}
	assert(isValidShuffle(d));
	counts[d[position]]++;
    }
    for (var i = 0; i < deckSize; i++) {
	counts[i] = counts[i] / numSamples;
    }
    return counts;
}

function lastCardStatistics(shuffler, deckSize, numSamples) {
    return positionStatistics(0, shuffler, deckSize, numSamples);
}

function lastPositionVariance(shuffler, deckSize, numSamples) {
    var prob = lastCardStatistics(shuffler, deckSize, numSamples);
    var expected = 1.0 / deckSize;
    var varSum = 0.0;
    for (var i = 0; i < deckSize; i++) {
	var diff = expected - prob[i];
	varSum = varSum + diff * diff;
    }
    return varSum;
}

function shuffleStandard(deckSize) {
    var src = initialDeck(deckSize);
    var dst = Array();
    var srcSize = deckSize;
    for (var i of [...Array(deckSize).keys()]) {
	var pick = Math.floor(Math.random() * srcSize);
	dst.push(src[pick]);
	--srcSize;
	src[pick] = src[srcSize];
    }
    return dst;
}

function shuffleNaive(deckSize) {
    var deck = initialDeck(deckSize);
    for (var i = 0; i < deck.length; i++) {
	var ix = Math.floor(Math.random() * deckSize);
	var card = deck[ix];
	deck[ix] = deck[i];
	deck[i] = card;
    }
    return deck;
}

function shuffleCrazyOnce(inDeck, slipRange, canStartR) {
    var split = Math.floor(inDeck.length / 2);
    var lslice = inDeck.slice(0, split);
    var rslice = inDeck.slice(split, inDeck.length);
    var lpos = 0;
    var rpos = 0;
    var outDeck = Array();

    var skipLeft = false;
    if (canStartR) {
	skipLeft = Math.random() < 0.5;
    }
    while (lpos < lslice.length || rpos < rslice.length) {
	var avail = lslice.length - lpos;
	if (avail > 0 && !skipLeft) {
	    var numCards = Math.floor(Math.random() * slipRange) + 1;
	    if (numCards > avail) {
		numCards = avail;
	    }
	    for (var i = 0; i < numCards; i++) {
		outDeck.push(lslice[lpos + i]);
	    }
	    lpos += numCards;
	}
	skipLeft = false;
	avail = rslice.length - rpos;
	if (avail > 0) {
	    var numCards = Math.floor(Math.random() * slipRange) + 1;
	    if (numCards > avail) {
		numCards = avail;
	    }
	    for (var i = 0; i < numCards; i++) {
		outDeck.push(rslice[rpos + i]);
	    }
	    rpos += numCards;
	}
    }
    return outDeck;
}

function shuffleCrazy(deckSize, minCards, slipRange, count) {
    var deck = initialDeck(deckSize);
    for (var i = 0; i < count; i++) {
	deck = shuffleCrazyOnce(deck, minCards, slipRange);
    }
    return deck;
}

function evaluateShuffles(deckSize, numSamples) {
    var shufflers = new Map([
	["standard", shuffleStandard],
	["naïve", shuffleNaive],
	["perfect1", function (deckSize) {
	    return shuffleCrazy(deckSize, 1, false, 1);
	}],
	["perfect7", function (deckSize) {
	    return shuffleCrazy(deckSize, 1, false, 7);
	}],
	["semiperfect1", function (deckSize) {
	    return shuffleCrazy(deckSize, 1, true, 1);
	}],
	["semiperfect7", function (deckSize) {
	    return shuffleCrazy(deckSize, 1, true, 7);
	}],
	["slip3count4", function (deckSize) {
	    return shuffleCrazy(deckSize, 3, true, 4);
	}],
	["slip3count7", function (deckSize) {
	    return shuffleCrazy(deckSize, 3, true, 7);
	}],
	["slip5count7", function (deckSize) {
	    return shuffleCrazy(deckSize, 5, true, 7);
	}],
    ]);
    var results = Array();
    for (var name of shufflers.keys()) {
	results.push([name, lastPositionVariance(shufflers.get(name),
						 deckSize,
						 numSamples)]);
    }
    return results;
}

console.log(evaluateShuffles(52, 100000));
