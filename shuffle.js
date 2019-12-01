#!/usr/bin/nodejs

var assert = require('assert')

function initialDeck(deckSize) {
    var cards=Array()
    for (var i of [...Array(deckSize).keys()]) {
	cards[i] = i
    }

    return cards
}

function shuffleStandard(deckSize) {
    var src = initialDeck(deckSize)
    var dst = Array()
    var srcSize = deckSize
    for (var i of [...Array(deckSize).keys()]) {
	var pick = Math.floor(Math.random() * srcSize)
	dst.push(src[pick])
	--srcSize
	src[pick] = src[srcSize]
    }
    return dst
}

function isValidShuffle(deck) {
    var seen = Array(deck.length).fill(false)
    for (var i of [...Array(deck.length).keys()]) {
	if (deck[i] < 0 || deck.length <= deck[i]) {
	    return false
	}
	if (seen[deck[i]]) {
	    return false
	}
	seen[deck[i]] = true
    }
    return true
}

function firstPositionStatistics(shuffler, deckSize, numSamples) {
    var counts = Array(deckSize).fill(0)
    for (var i = 0; i < numSamples; i++) {
	var d = shuffler(deckSize)
	assert(isValidShuffle(d))
	counts[d[0]]++
    }
    for (var i = 0; i < deckSize; i++) {
	counts[i] = counts[i] / numSamples
    }
    return counts
}

function firstPositionVariance(shuffler, deckSize, numSamples) {
    var prob = firstPositionStatistics(shuffler, deckSize, numSamples)
    var expected = 1.0 / deckSize
    var varSum = 0.0
    for (var i = 0; i < deckSize; i++) {
	var diff = expected - prob[i]
	varSum = varSum + diff * diff
    }
    return varSum
}

function shuffleAll(deckSize) {
    var deck = initialDeck(deckSize)
    for (var i = 0; i < deck.length; i++) {
	var ix = Math.floor(Math.random() * deckSize)
	var card = deck[ix]
	deck[ix] = deck[i]
	deck[i] = card
    }
    return deck
}

function evaluateShuffles(deckSize, numSamples) {
    var shufflers = new Map([["standard", shuffleStandard],
			["basic", shuffleAll]])
    var results = Array()
    for (var name of shufflers.keys()) {
	results.push([name, firstPositionVariance(shufflers.get(name),
						  deckSize,
						  numSamples)])
    }
    return results
}

console.log(evaluateShuffles(4, 100000))
