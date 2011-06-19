
/**
 * Model ChordModel
 * Properties:
 * pk - int - primary key (starts at 0)
 * name - string - name of the chord
 * notes - array - notes in the chord
 * answer - array - notes guessed by the user
 * correct - boolean - whether its correctly answered
 * num_attempt - int - start with 0, 1, 2 is max
 */

var ChordModel = Spine.Model.setup("ChordModel", 
                                   ["pk", 
                                    "name", 
                                    "notes", 
                                    "answer", 
                                    "correct", 
                                    "num_attempt"]
                                  );

// Class Properties
ChordModel.extend({

    /**
     * Method to create a random chord using the guitarjs lib
     */
    getRandom: function() {
        var note = Notes.names[Math.floor(Math.random()*Notes.names.length)],
        type = Chord.TYPES[Math.floor(Math.random()*Chord.TYPES.length)],
        chord_name = note+" "+type.code;
        return Chord.build(chord_name);        
    },

    /**
     * @return ChordModel/boolean 
     * next if next record is found it is returned other wise return false
     */
    getNext: function(curr) {
        var next = this.select(function (chord) {
            if (chord.pk === curr.pk+1) return true;
        });
        if (next) {
            return next[0];
        } else {
            return false;
        }
    },

    /**
     * @return ChordModel/boolean 
     * prev if prev record is found it is returned other wise return false
     */
    getPrev: function (curr) {
        var prev = this.select(function (chord) {
            if (chord.pk === curr.pk-1) return true;
        });
        if (prev) {
            return prev[0];
        } else {
            return false;
        }
    }
});