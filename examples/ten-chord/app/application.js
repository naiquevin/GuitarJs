/**
 * Code for all the controllers as well as the app controller
 */

jQuery(function($) {
    
    window.TenChordApp = Spine.Controller.create({
        el: $("#wrapper"),

        proxied: ["renderNext"],

        events: {
            "click #next-btn": "next",
            "click #prev-btn": "prev"
        },

        elements: {
            "#score-board": "scoreboard",
            "#question": "question"        
        },
        
        init: function () {
            // create the note buttons
            NotePicker.init();
            ChordModel.bind("create", this.renderNext);        
            this.chord = OneChord.init();             
            // show the first chord right away
            this.newChord();
        },

        next: function () {
            alert('hey');
            if (this.chord.next === null) {
                this.newChord();
                return;
            } else {
                
            }            
        },

        newChord : function () {
            var ch = ChordModel.getRandom(),
            last = ChordModel.last();
            ch.pk = last ? last.pk + 1: 0;
            ChordModel.create(ch);
        },

        renderNext: function (chord) {
            console.log(chord);
            this.chord.change(chord);
            return false;
        }

    });

    window.OneChord = Spine.Controller.create({
        el: $("h2#question"),

        init: function () {
            
        },

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
