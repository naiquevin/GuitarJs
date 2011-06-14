/**
 * Code for all the controllers as well as the app controller
 */

jQuery(function($) {
    
    window.TenChordApp = Spine.Controller.create({
        el: $("#wrapper"),

        proxied: ["render"],

        events: {
            "click #next-btn": "next",
            "click #prev-btn": "prev"
        },

        elements: {
            "#score-board": "scoreboard",
            "#question": "question",
            "#next-btn": "nextBtn",
            "#prev-btn": "prevBtn"
        },
        
        init: function () {
            // create the note buttons
            NotePicker.init();
            ChordModel.bind("create", this.render);        
            this.chord = OneChord.init();             
            // show the first chord right away
            this.newChord();
        },

        /**
         * next chord
         * if next present show, else create new
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
            ChordModel.create(ch);
        },

        /**
         * Render the chord on the screen
         * @param ChordModel record
         */
        render: function (chord) {
            this.chord.change(chord);
            this.updateButtons();
            return false;
        },

        /**
         * if its the first chord, hide the prev button
         * if its the last (10th) chord, hide the next button
         */
        updateButtons: function () {
            var current_pk = this.chord.current.pk;
            this.prevBtn.show();
            this.nextBtn.show();
            if (current_pk === 0) {
                this.prevBtn.hide();
            }
            if (current_pk === 9) {
                this.nextBtn.hide();
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
        },

        confirmAnswer: function () {
            
        }        
    });

    window.NotePicker = Spine.Controller.create({
        el: $("ul#notes"),
        
        elements: {
            "#notes li": "button"
        },

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
         * Will clear the selected notes
         */
        clear: function () {
            this.el.children().each(function () {
                $(this).removeClass("marked-note");
            });
        }
        
    });

    window.App = TenChordApp.init();

});
