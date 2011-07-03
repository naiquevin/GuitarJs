/**
 * Code for all the controllers as well as the app controller
 */

jQuery(function($) {
    
    window.TenChordApp = Spine.Controller.create({
        el: $("#wrapper"),

        proxied: ["render", "confirmed"],

        events: {
            "click #next-btn": "next",
            "click #prev-btn": "prev",
            "click #confirm-guess": "confirm"
        },

        elements: {
            "#score-board": "scoreboard",
            "#question": "question",
            "#next-btn": "nextBtn",
            "#prev-btn": "prevBtn",
            "#confirm-guess": "confirmBtn",
            "#buttons a": "controlButtons"
        },
        
        init: function () {
            // create the note buttons
            this.notePicker = NotePicker.init();
            this.scoreboard = Scoreboard.init();
            ChordModel.bind("create", this.render);
            ChordModel.bind("update", this.confirmed);            
            this.chord = OneChord.init();             
            // show the first chord right away
            this.newChord();
        },

        /**
         * next chord
         * if next present shown, else create new
         */
        next: function () {
            var next = ChordModel.getNext(this.chord.current)
            if (next) {
                this.render(next);
                return;
            } else {
                this.newChord();
            }            
        },

        /**
         * show the previous chord
         * not present case is impossible. So defensively throw an Error
         */
        prev: function () {
            var prev = ChordModel.getPrev(this.chord.current);
            if (prev) {
                this.render(prev);
                return;
            } else {
                throw new Error('Previous chord not found?!');
            }            
        },

        /**
         * create a new chord by using the ChordModel's create method
         */
        newChord : function () {
            var ch = ChordModel.getRandom(),
            last = ChordModel.last();
            ch.pk = last ? last.pk + 1: 0;
            ch.num_attempt = 0;
            ChordModel.create(ch);
        },

        /**
         * Render the chord on the screen
         * @param ChordModel record
         */
        render: function (chord) {
            this.chord.change(chord);
            this.updateButtons();
            this.notePicker.change(chord);
            return false;
        },

        /**
         * on click of the confirm/roll button
         * will be used to confirm the guess made by the user.
         * ..for both the attempts
         */
        confirm: function () {
            var guess = this.notePicker.getMarked("guessed");
            if (!guess[0]) {
                alert("Please select some notes by clicking on them");
                return;
            }
            this.chord.saveGuess(guess);
        },

        /**
         * Will be called after a guess has been confirmed.
         * Callback function of the update event of ChordModel
         */
        confirmed: function (chord) {
            //this.scoreboard.update(score);
            switch (chord.num_attempt) {
            case 2:
                // no more guesses allowed for this chord
                console.log("both guesses consumed");
                break;
            case 1:
                // 1 more guess to go
                console.log("1 more guess to go");
                break;
            case 0:
            default:
                return;                
            }
            this.updateButtons();
        },

        /**
         * if its the first chord, hide the prev button
         * if its the last (10th) chord, hide the next button
         */
        updateButtons: function () {
            var current_pk = this.chord.current.pk,
            current_num_attempt = this.chord.current.num_attempt,
            buttons = [
                { el: this.prevBtn, status: true },
                { el: this.nextBtn, status: true },
                { el: this.confirmBtn, status: true }                  
            ];
            this.controlButtons.show();
            // if first chord hide prev
            if (current_pk === 0) {
                buttons[0]['status'] = false;
            }
            // if last chord or current chord not answered yet, hide next
            if (current_pk === 9 || current_num_attempt < 2) {
                buttons[1]['status'] = false;
            }
            for (var i in buttons) {
                if (!buttons[i]['status']) {
                    var el = buttons[i]['el'];
                    el.hide();
                }
            }            
        }
    });

    window.OneChord = Spine.Controller.create({
        el: $("h2#question"),        

        init: function () {

        },

        /**
         * Change the current chord
         */
        change: function (item) {            
            this.current = item;
            this.render();
        },

        render: function () {
            this.el.text(this.current.name);            
            var $list = $("#chord-list");
            $list.children().removeClass('active');
            // append to the chord list if its a new chord
            if (!$("#pk-"+this.current.pk).length) {
                var elements = $("#chordlistTemplate").tmpl(this.current);            
                $list.append(elements[0]);
            } else {
                $("#pk-"+this.current.pk).addClass('active');
            }
        },

        saveGuess: function (guess) {
            this.current.num_attempt++;
            this.current.guess = guess;
            var result = this.evaluateGuess(guess);
            this.current.correct = result.correct;
            if (this.current.score_id) {
                var score = ScoreModel.find(this.current.score_id);
                score.scores.push(result.score);
            } else {
                var score = ScoreModel.create({ scores: [result.score]});
            }
            score.save();
            this.current.score_id = score.id;
            this.current.save();    
        },

        /**
         * Evaluate the guess and find out the correctly guessed notes
         * and calculate the points
         * @return object {correct: [], score: int}
         */
        evaluateGuess: function (guess) {
            var notes = this.current.notes,
            correct = [];
            // console.log(notes, guess);
            for (var i = 0; i < guess.length; i++) {
                // safe to use jQuery.inArray here
                if ($.inArray(guess[i], notes) !== -1) {
                    correct.push(guess[i]);
                }
            }
            return {
                correct: correct,
                score: Math.round(correct.length/notes.length * 10)
            };
        }

    });

    window.NotePicker = Spine.Controller.create({
        el: $("ul#notes"),
        
        elements: {
            "#notes li": "button"
        },

        events: {
            "click #notes li": "toggleGuess"
        },

        proxied: ["toggleGuess", "onGuess"],

        currentChord: null,

        NOTE_STATUS: {
            guessed: "guessed-note",
            correct: "correct-note",
            incorrect: "incorrect_note"
        },

        init: function () {
            this.render();
            ScoreModel.bind("update", this.onGuess);
        },

        render: function () {
            var html = '',
            n;            
            for (var i in Notes.names) {
                n = Notes.names[i];
                html += '<li id="'+Notes.slugify(n)+'">' + n + '</li>';
            }
            this.el.append(html);            
        },

        /**
         * Will mark and unmark the clicked note as guessed note
         */
        toggleGuess: function (event) {
            $(event.target).toggleClass(this.NOTE_STATUS.guessed);
        },

        /**
         * Will clear all the guessed notes
         */
        clear: function () {
            var class_attr = this.NOTE_STATUS.guessed;
            this.el.children().each(function () {
                $(this).removeClass(class_attr);
            });
        },

        /**
         * When a chord is changed, the buttons will be 
         * marked/unmarked accordingly
         */
        change: function (chord) {            
            this.clear();
            this.currentChord = chord;
            if (chord.guess) {
                for (var i = 0; i < chord.guess.length; i++) {
                    this.mark(chord.guess[i], "guessed");
                }
            }
        },

        /**
         * after the user makes a guess, this method will be 
         * called as a callback of update event of the 
         * ScoreModel object
         * Depending upon the correctness of the guesses, the 
         * notes will be highlighted
         */
        onGuess: function (score) {
            console.log(this.currentChord);
        },

        /**
         * will mark the note as guessed by the user
         * @param name - string - name of the note to be marked
         * @param status - string - status it is to be marked as 
         */
        mark: function (name, status) {
            var class_attr = this.NOTE_STATUS[status];
            $("#"+Notes.slugify(name)).addClass(class_attr);
        },

        getMarked: function (status) {
            var marked = [],
            class_attr = this.NOTE_STATUS[status];
            this.el.children().filter("."+class_attr).each(function () {
                marked.push(Notes.unslugify($(this).attr('id')));
            });
            return marked;
        }        
    });

    window.Scoreboard = Spine.Controller.create({
        el: $("#score-board>ul"),

        init: function () {
            this.render();
        },

        render: function () {
            var html = '';
            for (var j = 0; j < 10; j++) {
                if (j === 0) {
                    html += '<li class="leftmost">';                    
                } else if (j === 9) {
                    html += '<li class="rightmost">'
                } else {
                    html += '<li>';
                }
                html += '<ul class="chances">';
                var k = j === 9 ? 3 : 2;
                for (var i = 0; i < k; i++) {
                    html += '<li></li>';
                }
                html += '</ul>';
                html += '<div></div>';
                html += '</li>';
            }
            this.el.append(html);
        },

        update: function (score) {
            alert('hey');
        }
    });

    window.App = TenChordApp.init();

});
