
/**
 * Model ChordModel
 * Properties:
 * pk - int - primary key (starts at 0)
 * name - string - name of the chord
 * notes - array - notes in the chord
 * guess - array - notes guessed by the user
 * correct - array - most recent guess by the user
 * num_attempt - int - start with 0, 1, 2 is max
 * score_id - id reference of the ScoreModel Object stored in memory
 */

var ChordModel = Spine.Model.setup("ChordModel", 
                                   ["pk", 
                                    "name", 
                                    "notes", 
                                    "guess", 
                                    "correct", 
                                    "num_attempt",
                                    "score_id"
                                   ]
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

var ScoreModel = Spine.Model.setup("ScoreModel", ["chord_pk", "scores", "total"]);

// Class Properties
ScoreModel.extend({

    /**
     * Method to compute the score after each roll
     * @param ScoreModel object so far for the current frame
     * @return int score for this roll
     */
    getRollScore: function (score) {
        var scores = score.scores;
        if (scores.length === 2) {
            return scores[1] - scores[0];
        } else if (scores.length === 1) {
            return scores[0];
        }
    },

    /**
     * Method to compute the total score for each frame so far
     * @param ScoreModel Object score for the frame
     * @return int total score for the frame so far
     */
    getTotalScore: function (score) {
        return score.scores[score.scores.length - 1];
    }
});