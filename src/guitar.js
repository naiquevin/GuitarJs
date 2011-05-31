/**
 * @author Vineet Naik, 
 * naikvin at gmail dot com, 
 * http://vineetnaik.me
 * @naiquevin
 * 
 * GuitarJS is a Javascript library for dealing with building blocks of music 
 * ie. notes, chords and scales particularly for a 6 string guitar 
 */


/**
 *  variables accessible in global context
 *  [Notes, Chord, ScaleFactory, Guitar]
 */
(function () {

    var global = window;
    
    var Notes = global.Notes = Notes || {
	
	names : [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ],
	
        /**
         * will rearrange notes starting from the specified root
         */
	_rearrangeNotes : function (root) {
	    var pos = null;
	    for (var i = 0; i < 12; i++) {
		if (this.names[i] === root) {
		    pos = i;
		    break;
		}
	    }
	    if(pos === null){
		throw "Root note out of limit and invalid";
	    }
	    return this.names.slice((pos - 12)).concat(this.names.slice(0, pos));		
	},
	
	/**
	 * quick and dirty way to get the sharp or flat of a note
	 * by rearranging the notes
	 * TODO a better method
	 */
	_sharpen : function (note) {		
	    var ra = this._rearrangeNotes(note);
	    return ra[1];
	},	
	_flatten : function (note) {		
	    var ra = this._rearrangeNotes(note);
	    return ra[11];
	}		
    };

    var Chord = global.Chord = Chord || {

	TYPES : [
	    {
		name : 'major',
		code : 'Maj',
		refScale : 'major',
		notes : [ 1, 3, 5 ]	
	    },		
	    {
		name : 'minor',
		code : 'Min',
		refScale : 'major',
		notes : [ 1, "b3", 5 ]			
	    },		
	    {
		name : 'augmented',
		code : 'Aug',
		refScale : 'major',
		notes : [ 1, 3, "#5" ]		
	    },		
	    {
		name : 'diminished',
		code : 'Dim',
		refScale : 'major',
		notes : [ 1, "b3", "b5" ]			
	    }
	],
	
        /**
         * Get the dictionary from the code
         */
	_getProperties : function (code) {	
	    for(var i in this.TYPES){
	 	if(code === this.TYPES[i].code){
	 	    return this.TYPES[i];
	 	}			
	    }	
	},
	
	build : function (str) {	    
	    var notes = [],
	    arr = str.split(" "),	
	    root = arr[0],
	    code = arr[1],
	    properties = this._getProperties(code);	    
	    var scale = ScaleFactory.getScale(root, properties.refScale);	
	    scale.load();	    
	    for (var i = 0; i < properties.notes.length; i++) {	 					
	 	switch (typeof properties.notes[i]) {
	 	case "number" :
	 	    var n = scale.notes[properties.notes[i] - 1];
	 	    notes.push(n);
	 	    break;
	 	    
	 	case "string" :			
	 	    var n = scale.notes[properties.notes[i].substr(1) - 1];
	 	    if (properties.notes[i].charAt(0) === "b") { //flat				
	 		notes.push(Notes._flatten(n));				
	 	    }			
	 	    else if (properties.notes[i].charAt(0) === "#") { //sharp				
	 		notes.push(Notes._sharpen(n));	
	 	    }
	 	    break;
	 	}
	    }	 		
	    return { name : str, notes : notes  };	
	}	
    };


    /**
     * Scales
     */
    var ScaleFactory = global.ScaleFactory = {	
	/**
	 * to be used like a static function
	 * @param String root
	 * @param String type
	 * @return  Object Scale
	 */
	getScale : function (root, type) {		
	    switch (root) {		
	    case "major" :
	    default :
		return new Scale.Major(root);
		break;
	    }	
	}	
    };

    var Scale = Scale || { };

    /**
     * Abstract Scale class
     */
    Scale.abs = function () {
	this.root;
	this.formula;
	this.notes = [];
	this.off = [];
	this.toString;
    };

    Scale.abs.prototype.toString = function () {
	var delimiter = "^";	
	return this.notes.join(delimiter);
    };

    Scale.abs.prototype.load = function () {
	this.notes = Notes._rearrangeNotes(this.root);
	for (var i = 0; i < this.off.length; i++) {
	    //splice will remove and shift elements, hence this.off[i]-i
	    this.notes.splice(this.off[i]-i,1);
	}	
    };

    /*
     * major scale formula - W W H W W W H,
     * so we rearrange the notes starting with the root 
     * and remove keys - 1, 3, 6, 8, 10
     */
    Scale.Major = function (root) {	
	this.root = root;
	this.off = [1, 3, 6, 8, 10];	
	this.formula = "r~ W W H W W W H";
    };

    Scale.Major.prototype = new Scale.abs();

    /**
     * All guitar specific stuff begins here
     */
    var Guitar = global.Guitar = Guitar || { };

    /**
     * Guitar Fretboard (6 strings ~ 24 frets ~ std tuning)
     */	
    Guitar.Fretboard = (function () {			
	var strings = [ null, "E", "B", "G", "D", "A", "E"  ];			
	var fretmap =  [ null ];			
	for (var i = 1; i <= 6 ; i++){				
	    var notes = [ ],
	    open = strings[i],
	    ra = Notes._rearrangeNotes(open);	
	    
	    for (var j=0; j < ra.length; j++) {
		notes.push(ra[j]);
	    }
	    for (var j=0; j < ra.length; j++) {
		notes.push(ra[j]);
	    }
	    notes.push(open);
	    //console.log(notes);
	    fretmap.push(notes);				
	}
	
	function inArray (needle, hay) {
	    for(var i = 0; i < hay.length; i++) {
		if(needle === hay[i]){
		    return true;
		}
	    }
	    return false;
	}
	
	return {
	    
	    /**
	     * Array fretMap[1] = 1st String
	     * Array fretMap[3][13] = 13th fret on 3rd string 
	     */
	    fretMap : fretmap,
	    
	    /**
	     * @param string note
	     * @return array of all positions where this note is found on a 24 frets, 6 string guitar
	     * eg. oc[2] = array of positions where the note is found on the 2nd string
	     */
	    findOccurrences : function (note) {
		var tot = [ null ];				
		for(var i = 1; i < fretmap.length; i++) {
		    var o = [ ];
		    for(var j = 0; j < fretmap[i].length; j++) {						 
			if(fretmap[i][j] === note){							
			    o.push(j);
			    while (j <= 12) {								
				j += 12;								
				o.push(j);								
			    }
			    break;
			}						
		    }
		    tot.push(o);
		}
		return tot;
	    }
	};	
    }) ();	

    Guitar.Chord = function (str) { 
        this.notes = Chord.build(str).notes;
	this.root = this.notes[0];
        this.occ = Guitar.Fretboard.findOccurrences(this.root);  
        this.init();
    };

    Guitar.Chord.prototype = {

        init : function () { 
            this.first = true;
            this.string = 6;
            this.fret_index = 0;
        },

        has_next : function () {
            var next_string = this.string,
            next_fret_index = this.fret_index;
            if (this.first) {
                return true;
            }
            if (typeof this.occ[this.string][this.fret_index+1] !== 'undefined') {
                next_fret_index++;
            } else {
                next_fret_index = 0;
                next_string--;
            }
            if (!this.occ[next_string] || typeof this.occ[next_string][next_fret_index] === 'undefined') {
                return false;
            } else {
                return true;
            }
        },        

        /**
         * Private function 
         * To compute the position of the next reference fret on the fretboard 
         */
        _compute_next_pos : function () {            
            if (this.first) {
                this.first = false;
                return;
            }
            if (typeof this.occ[this.string][this.fret_index+1] !== 'undefined') {
                this.fret_index++;
            } else {
                this.fret_index = 0;
                this.string--;
            }
        },

        next : function () {
            this._compute_next_pos();
            this.fret = this.occ[this.string][this.fret_index];
            return this._build([this.string, this.fret], [0, 4]);
        },

        /**
         * a function to build a chord around a root at a given
         * position and within a given range
         * @param position array [<string>, <fret>] eg. [6, 5]
         * @param range [<lower>, <higher>] eg. [-2, 2]
         */
        _build : function (position, range) {
            var string = position[0],
            fret = position[1];                    
            var chord = {  };
            chord[string] = fret;
            for (var n in this.notes) {
                var result = Guitar.Chord._find_notes_in_proximity({ note: this.root, pos: position }, this.notes[n], range);
                for (var p in result) {
                    if (chord[p]) { //if more than two in same pos, take whichever is closer to the root
                        chord[p] = Math.abs(fret - chord[p]) < Math.abs(fret - result[p]) ? chord[p] : result[p] ;
                    } else {
                        chord[p] = result[p];
                    }
                }                    
            }
            return chord;            
        }
    };

    /**
     * private static method to find all the target notes which are found in the 
     * proximity of the root
     * @param root { note: "A", pos: [6,5] }
     * @param target target note
     * @param range [0, 4] or [-2, 2] or [-4, 0]
     * @return result { 4: 7, 1: 5 } i.e. { <string> : <fret>, .... }
     */
    Guitar.Chord._find_notes_in_proximity = function (root, target, range) {
        var target_occ = Guitar.Fretboard.findOccurrences(target),
        string = root.pos[0],
        fret = root.pos[1],
        lower_limit = fret + range[0], //lower limit is passed negative or zero
        upper_limit = fret + range[1],
        result = { };
        //run a loop the occurrences array
        for (var i = 6; i > 0; i--) {
            if (i === string) {
                continue;
            }
            positions = target_occ[i];
            //for each string loop through the positions
            for (var j = 0; j < positions.length; j++) {
                //if the position is within the range, then add it to the object
                if (positions[j] >= lower_limit && positions[j] <= upper_limit) {
                    result[i] = positions[j];
                }
            }                    
        }
        return result;
    };    

    Guitar.Chord.create = function (str) {
        // TODO cache already computed chords here
        return new Guitar.Chord(str);
    };    
    
}) ();