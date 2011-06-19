$(document).ready(function () {

    module("Notes");

    test('Names', function () {
        var notes = Notes.names;
        equals(notes.length, 12, '12 of them in all');
        equals(notes[0], "C", 'Initially starts with "C"..');
        equals(notes[11], "B", '..and ends with "B"');
    });

    test('Rearrange Notes', function () {        
        var rearranged_A = Notes._rearrangeNotes("A");
        equals(rearranged_A.length, 12, 'still 12 of them after rearranging');
        equals(rearranged_A[0], "A", 'first one is the root');
        equals(rearranged_A[11], "G#", 'and ends with G#');
        var rearranged_Fs = Notes._rearrangeNotes("F#");
        equals(rearranged_Fs[0], "F#", 'first one is the root');
    });

    test('Sharpen a note', function () {
        equals("F#", Notes._sharpen("F"));
        equals("C", Notes._sharpen("B"));
        equals("F", Notes._sharpen("E"));
    });

    test('Flatten a note', function () {
        equals(Notes._flatten("E"), "D#");
        equals(Notes._flatten("G#"), "G");
        equals(Notes._flatten("F"), "E");
    });

    test('Validate a note', function () {
        ok(Notes._validate("E"), "E is fine");
        ok(!Notes._validate("E#"), "But E# isn't");
        ok(!Notes._validate("B#"), "Neither is B#");        
    });

    test('Slugify a note', function() {
        equals(Notes.slugify("C#"), "c-sharp");
        equals(Notes.slugify("F"), "f");
        raises(Notes.slugify, Error, "Invalid Note B#");               
    });

    test('Unslugify a note', function() {
        equals(Notes.unslugify("f-sharp"), "F#");
        equals(Notes.unslugify("g"), "G");
        raises(Notes.unslugify, Error, "Invalid Note e-sharp");               
    });

    module("Chord");

    test('Properties from Code', function () {
        var props = Chord._getProperties("Dim");
        equals(props.name, "diminished", 'check name');
        equals(props.refScale, "major", 'check reference scale');
        same(props.notes, [1, "b3", "b5"], 'check the notes');
    });

    test('Chord Notes', function () {
        same(Chord.build("A Min").notes, ["A", "C", "E"]);
        same(Chord.build("C Maj").notes, ["C", "E", "G"]);
        //TODO test a few more after verifying
    });

    module("ScaleFactory");

    test("factory and major scale", function () {
        var scale = ScaleFactory.getScale("F");
        scale.load();
        equals(scale.formula, 'r~ W W H W W W H', 'the major scale formula');
        equals(scale.notes.length, 7, '7 notes in a scale');
        equals(scale.notes[0], "F", 'first note is root');
        equals(scale.toString(), 'F^G^A^A#^C^D^E');
    });

    module("Guitar Fretboard");

    test("fretboard occurences", function () {
        var occ = Guitar.Fretboard.findOccurrences("C");
        equals(occ[0], null, 'there is no zeroth string');
        equals(occ[1][0], 8, 'C - 1st string 8th fret');
        equals(occ[6][0], 8, 'C - Also 6th string 8th fret');
        equals(occ[5][0], 3, 'C - 3rd fret on the 5th string');
        var total_c = 0;
        for (var i = 1; i <= 6; i++) {
            total_c += occ[i].length;
        }
        equals(total_c, 12, 'C - total 12 occurences on a 24 fret guitar');
        var total_e = 0;
        var occ = Guitar.Fretboard.findOccurrences("E");
        for (var i = 1; i <= 6; i++) {
            total_e += occ[i].length;
        }
        equals(total_e, 14, 'E - on the otherhand has all 14 occurences due to 2 open strings');
        var total = 0,
        all_notes = Notes.names;
        for (var j in all_notes) {
            var occ = Guitar.Fretboard.findOccurrences(all_notes[j]);
            for (var k = 1; k <= 6; k++) {
                total += occ[k].length;
            }
        }
        equals(total, 24*6+6, 'occurences of all notes add upto 24*6 frets + 6 open notes');
    });
});
