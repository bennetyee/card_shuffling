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

function evaluateShuffles(deckSize, numSamples) {
    var shufflers = new Map([["standard", shuffleStandard],
			     ["naïve", shuffleNaive]]);
    var results = Array();
    for (var name of shufflers.keys()) {
	results.push([name, lastPositionVariance(shufflers.get(name),
						 deckSize,
						 numSamples)]);
    }
    return results;
}

console.log(evaluateShuffles(4, 100000));
