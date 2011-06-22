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
         * on click of the confirm button
         * will be used to confirm the guess made by the user.
         * will be used for both the attempts
         */
        confirm: function () {
            var guess = this.notePicker.getMarked();
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
            // if no note button pressed, hide confirm
            // var guess = this.notePicker.getMarked();
            // if (!guess[0]) {
            //     buttons[2]['status'] = false;
            // }
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
            this.current.answer = guess;
            this.current.save();            
        }        
    });

    window.NotePicker = Spine.Controller.create({
        el: $("ul#notes"),
        
        elements: {
            "#notes li": "button"
        },

        events: {
            "click #notes li": "toggleMark"
        },

        proxies: ["mark"],

        init: function () {
            this.render();
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
         * Will mark and unmark the clicked note
         */
        toggleMark: function (event) {            
            $(event.target).toggleClass("marked-note");
        },

        /**
         * Will clear all the selected notes
         */
        clear: function () {
            this.el.children().each(function () {
                $(this).removeClass("marked-note");
            });
        },

        /**
         * When a chord is changed, the buttons will be 
         * marked/unmarked accordingly
         */
        change: function (chord) {
            this.clear();
            if (chord.answer) {
                for (var i = 0; i < chord.answer.length; i++) {
                    this.mark(chord.answer[i]);
                }
            }
        },

        mark: function (name) {
            $("#"+Notes.slugify(name)).addClass("marked-note");
        },

        getMarked: function () {
            var marked = [];
            this.el.children().filter(".marked-note").each(function () {
                marked.push(Notes.unslugify($(this).attr('id')));
            });
            return marked;
        }
        
    });

    window.App = TenChordApp.init();

});
