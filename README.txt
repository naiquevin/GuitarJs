General Information
-------------------
Guitarjs is a small library for playing with 
basic music related stuff in javascript, such as 
notes, chords, scales and extended for a 6 string guitar
for getting all possible voicings of a chord

Basic Usage
-----------

Build a chord
Chord.build("A Maj")

Array representation of all notes on the Fretboard
Guitar.Fretboard.fretMap

Array representation of all occurences of a note on a 
6 string 24 fret guitar
Guitar.Fretboard.findOccurrences("A")

All possible voicings of a chord 
(Testing in progress. Might be flaky as of now.)
var ch = Guitar.Fretboard.create("F# Min")
while (ch.has_next()) {
      voicing = ch.next();
      console.log(voicing);
}
