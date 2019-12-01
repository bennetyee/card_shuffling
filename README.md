# card_shuffling

Demonstration of card shuffling algorithm and bias.  Intended for
beginning programmers.

There are many ways to shuffle cards.  The "standard" algorithm in
textbooks is pretty well known to more experienced programmers.  This
git repository contains several not-as-good shuffling algorithms that
a beginning programmer might conceive of or stumble upon, and provides
a framework for evaluating them.

## Randomness and Bias

Typically, the result that we want from a shuffling algorithms is a
"shuffled" deck of cards.  But what do we mean by "shuffled"?

A working definition is that each card can appear in any position in
the deck with equal probability.  And a deck is an ordered enumeration
of all the cards, with all cards appearing, and no card appearing more
than once.

The code here is parameterized, to allow any sized decks.  Without
loss of generality, we number the cards from 0 to N-1 for a deck of N
cards.  If we are working with a standard deck of 4 suits with 13
cards each, one might assign clubs to the number range 0-12, hearts to
13-25, diamonds to 26-38, and spades to 39-51, so given a card M in
[0..51], its suit number is int(M/13) and rank number is given by M
mod 13 to correspond to ace, two, ..., ten, jack, queen, and king
respectively.
