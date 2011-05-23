$(document).ready(function () {

    // test('Fretboard._find_in_proximity', function () {
    //     var root = { note : "A", pos : [5,0]};
    //     var range = [0, 4];
    //     var result = Fretboard._find_in_proximity(root, "A", range);
    //     same({ 3 : 2 }, result, 'testing with range [0, 4]');
    //     var root = { note : "A", pos : [6,5]};
    //     var range = [-2, 2];
    //     var result = Fretboard._find_in_proximity(root, "A", range);
    //     same({ 4: 7, 1: 5 }, result, 'testing for range [-2, 2]');
    //     var root = { note : "A", pos : [5,0]};
    //     var range = [-4, 0];
    //     var result = Fretboard._find_in_proximity(root, "A", range);
    //     same({  }, result, 'testing for range [-4, 0] starting on open root');
    // });

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
});
