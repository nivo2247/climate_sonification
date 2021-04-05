import * as React from 'react';
import * as Tone from 'tone';
import { Page } from './Page.js';
import { playUrl, loading } from './../const/url.js';

/* used to wait a certain amount of ms */
const timer = ms => new Promise(res => setTimeout(res, ms));

// I'm not sure if we need this inside the class or not
// it seems like we shouldn't.  In the long term we should
// consider a sampler, or at least build a synth in a separate
// file and import it.
// const synth = new Tone.Synth.toDestination();

/*** Shared class for EachAlone and AllTogether class ***/
export class Simulation extends Page {

	constructor(props){
	    super(props)
		this.state.pageBottom = window.clientHeight - this.state.PADDING;
		this.state.pageRight = window.clientWidth - this.state.PADDING;
		this.state.index = 0;
		this.state.play = 0;
		this.state.waiting = 0;
		this.state.notePlaying = 0;
		this.state.timerLen = 800;
		this.state.playButton = playUrl;
		this.state.token = "";
		this.state.latitude = 0;
		this.state.longitude = 0;
		this.state.CONTROLDIV = 2 / 10;
		this.state.CONTROLVERTDIV = 1;
		this.state.SKINNYDIV = 1 / 20;
		this.state.MAPDIV = 3 / 4;
		this.state.MAPVERTDIV = 3 / 4;
		this.state.GRAPHVERTDIV = 2 / 10;
		this.state.SLIDERVERTDIV = 1 / 20;
		this.state.CONTROLSPLIT = 1;
		this.state.useArray = 0;
		this.state.audioAvailable = false;
		this.state.precipNotes = [];
		this.state.tempNotes = [];
		this.state.iceNotes = [];
		this.state.precipNotes1 = [];
		this.state.tempNotes1 = [];
		this.state.iceNotes1 = [];
		this.state.precipNotes2 = [];
		this.state.tempNotes2 = [];
		this.state.iceNotes2 = [];
		this.state.closestCity = '';
		// I'm pretty sure I need to bind the index incrementer
		this.incrementIndex = this.incrementIndex.bind(this);
	}  
	
    getPlayButton = () => {
	if(this.state.waiting > 0){
		return loading;
	}
	else{
		return this.state.playButton;
	}
    }
    
    getGraphDims = () => {
    	var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    	var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
	    	
    	var bottom = graphBottom - 1;
    	var right = modelWidth - 1;
    	
    	var step = right / 180;
       	var avg = bottom / 2;
    		
    	var co2_median = 300;
    	var co2_range = 700;
    	var co2_avg = Math.floor(avg * 1.6);
    	
    	return({ step, avg, co2_median, co2_range, co2_avg });
    }
    
    getPrecipGraphVars = (data) => {
    	var precip_median = 100;
    	var precip_max = this.getLargestVal(data, 0) + 40;
    	var precip_range = precip_max - precip_median;
    	return { precip_median, precip_range };
    }
    
    getTempGraphVars = (data, avg) => {
   	var temp_median = 0;
    	var temp_max = this.getLargestVal(data, 0) + 3;
    	var temp_range = temp_max;
    	var temp_avg = Math.floor(avg * 1.5);
    	return { temp_median, temp_range, temp_avg };
    }
	
	getValByIndex = (arr, ind) => {
		var avgKeys = Object.keys(arr[0]);
    		var useAvgKey = avgKeys[ind+2];
    		var val = arr[0][useAvgKey];
    		return val;
	}
	
	getLargestVal = (arr, start) => {
		var avgKeys = Object.keys(arr[0]);
		var useAvgKey, val;
		var largestVal = start;
		for(var i = 0; i <= 180; i++){
    			useAvgKey = avgKeys[i+2];
    			val = arr[0][useAvgKey];
    			if(val > largestVal){
    				largestVal = val;
    			}
    		}
    		return largestVal;
	}
	
	getValByCoord = (arr, coord) => {
		var avgKeys0 = Object.keys(arr[coord]);
    		var useAvgKey0 = avgKeys0[0];
    		var val = arr[coord][useAvgKey0];
    		return val;
	}
	
	setPrecipNotes = (data) => {
		var precipNoteArr = [];
		var precip_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			precip_val = this.getValByIndex(data, i);
    			note = this.getNote(0, precip_val);
    			precipNoteArr.push(note)
		}
		
		this.setState({
			precipNotes: [...precipNoteArr]
		});
	}
	
	setPrecipNotes1 = (data) => {
		var precipNoteArr = [];
		var precip_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			precip_val = this.getValByIndex(data, i);
    			note = this.getNote(0, precip_val);
    			precipNoteArr.push(note)
		}
		
		this.setState({
			precipNotes1: [...precipNoteArr]
		});
	}
	
	setPrecipNotes2 = (data) => {
		var precipNoteArr = [];
		var precip_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			precip_val = this.getValByIndex(data, i);
    			note = this.getNote(0, precip_val);
    			precipNoteArr.push(note)
		}
		
		this.setState({
			precipNotes2: [...precipNoteArr]
		});
	}
	
	setTempNotes = (data) => {
		var tempNoteArr = [];
		var temp_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			temp_val = this.getValByIndex(data, i);
    			note = this.getNote(1, temp_val);
    			tempNoteArr.push(note);
    			
		}
		
		this.setState({
			tempNotes: [...tempNoteArr]
		});
	}
	
	setTempNotes1 = (data) => {
		var tempNoteArr = [];
		var temp_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			temp_val = this.getValByIndex(data, i);
    			note = this.getNote(1, temp_val);
    			tempNoteArr.push(note);
    			
		}
		
		this.setState({
			tempNotes1: [...tempNoteArr]
		});
	}
	
	setTempNotes2 = (data) => {
		var tempNoteArr = [];
		var temp_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			temp_val = this.getValByIndex(data, i);
    			note = this.getNote(1, temp_val);
    			tempNoteArr.push(note);
    			
		}
		
		this.setState({
			tempNotes2: [...tempNoteArr]
		});
	}
	
	setIceNotes = (data) => {
		var iceNoteArr = [];
		var ice_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			ice_val = this.getValByIndex(data, i);
    			note = this.getNote(2, ice_val);
    			iceNoteArr.push(note);
		}
		
		this.setState({
			iceNotes: [...iceNoteArr]
		});
	}
	
	setIceNotes1 = (data) => {
		var iceNoteArr = [];
		var ice_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			ice_val = this.getValByIndex(data, i);
    			note = this.getNote(2, ice_val);
    			iceNoteArr.push(note);
		}
		
		this.setState({
			iceNotes1: [...iceNoteArr]
		});
	}
	
	setIceNotes2 = (data) => {
		var iceNoteArr = [];
		var ice_val;
		var note;
		
		for(var i = 0; i < 181; i++){
    			ice_val = this.getValByIndex(data, i);
    			note = this.getNote(2, ice_val);
    			iceNoteArr.push(note);
		}
		
		this.setState({
			iceNotes2: [...iceNoteArr]
		});
	}
	
	getNote = (type, value) => {
		var retval = 'Ab5';
		// Ab Major
		if(type === 0){
			if(value < 50){
				retval = 'Ab2';
			}else if(value < 60){
				retval = 'Bb2';
			}else if(value < 70){
				retval = 'C3';
			}else if(value < 75){
				retval = 'Db3';
			}else if(value < 80){
				retval = 'Eb3';
			}else if(value < 85){
				retval = 'F3';
			}else if(value < 90){
				retval = 'G3';
			}else if(value < 92.5){
				retval = 'Ab3';
			}else if(value < 95){
				retval = 'Bb3';
			}else if(value < 97.5){
				retval = 'C4';
			}else if(value < 100){
				retval = 'Db4';
			}else if(value < 102.5){
				retval = 'Eb4';
			}else if(value < 105){
				retval = 'F4';
			}else if(value < 107.5){
				retval = 'G4';
			}else if(value < 110){
				retval = 'Ab4';
			}else if(value < 115){
				retval = 'Bb4';
			}else if(value < 120){
				retval = 'C5';
			}else if(value < 125){
				retval = 'Db5';
			}else if(value < 130){
				retval = 'Eb5';
			}else if(value < 135){
				retval = 'F5';
			}else if(value < 140){
				retval = 'G5';
			}else if(value < 145){
				retval = 'Ab5';
			}else if(value < 150){
				retval = 'Bb5';
			}else if(value < 155){
				retval = 'C6';
			}else if(value < 160){
				retval = 'Db6';
			}else if(value < 165){
				retval = 'Eb6';
			}else if(value < 170){
				retval = 'F6';
			}else if(value < 175){
				retval = 'G6';
			}else if(value < 180){
				retval = 'Ab6';
			}else if(value < 190){
				retval = 'Bb6';
			}else if(value < 200){
				retval = 'C7';
			}else if(value < 220){
				retval = 'Db7';
			}else if(value < 240){
				retval = 'Eb7';
			}else if(value < 260){
				retval = 'F7';
			}else if(value < 280){
				retval = 'G7';
			}else{
				retval = 'Ab7';
			}
			
		}
		// harmonic minor (ascending).  Note that Phrygian dominant and spanish gypsie are both the 5th mode
		// of harmonic minor.  Since this isn't a composition, and the data can do what it wants (won't necessarily
		// revolve around some root note) these are all effectively the same scale.
		else if(type === 1){
			if(value < -0.5){
				retval = 'Ab2';
			}else if(value < -0.25){
				retval = 'Bb2';
			}else if(value < 0){
				retval = 'B2';
			}else if(value < 0.05){
				retval = 'Db3';
			}else if(value < 0.1){
				retval = 'Eb3';
			}else if(value < 0.15){
				retval = 'E3';
			}else if(value < 0.2){
				retval = 'G3';
			}else if(value < 0.3){
				retval = 'Ab3';
			}else if(value < 0.4){
				retval = 'Bb3';
			}else if(value < 0.5){
				retval = 'B3';
			}else if(value < 0.6){
				retval = 'Db4';
			}else if(value < 0.75){
				retval = 'Eb4';
			}else if(value < 1){
				retval = 'E4';
			}else if(value < 1.25){
				retval = 'G4';
			}else if(value < 1.5){
				retval = 'Ab4';
			}else if(value < 1.75){
				retval = 'Bb4';
			}else if(value < 2){
				retval = 'B4';
			}else if(value < 2.5){
				retval = 'Db5';
			}else if(value < 3){
				retval = 'Eb5';
			}else if(value < 3.5){
				retval = 'E5';
			}else if(value < 4){
				retval = 'G5';
			}else if(value < 4.5){
				retval = 'Ab5';
			}else if(value < 5){
				retval = 'Bb5';
			}else if(value < 6){
				retval = 'B5';
			}else if(value < 7){
				retval = 'Db6';
			}else if(value < 8){
				retval = 'Eb6';
			}else if(value < 9){
				retval = 'E6';
			}else if(value < 10){
				retval = 'G6';
			}else if(value < 11){
				retval = 'Ab6';
			}else if(value < 12){
				retval = 'Bb6';
			}else if(value < 13){
				retval = 'B6';
			}else if(value < 14){
				retval = 'Db7';
			}else if(value < 15){
				retval = 'Eb7';
			}else if(value < 16){
				retval = 'E7';
			}else{
				retval = 'G7';
			}
		}
		// Double harmonic
		else if(type === 2){
			if(value > 0.98){
				retval = 'G6';
			}else if(value > 0.96){
				retval = 'E6';
			}else if(value > 0.955){
				retval = 'Eb6';
			}else if(value > 0.95){
				retval = 'Db6';
			}else if(value > 0.945){
				retval = 'C6';
			}else if(value > 0.94){
				retval = 'A5';
			}else if(value > 0.93){
				retval = 'Ab5';
			}else if(value > 0.92){
				retval = 'G5';
			}else if(value > 0.91){
				retval = 'E5';
			}else if(value > 0.90){
				retval = 'Eb5';
			}else if(value > 0.89){
				retval = 'Db5';
			}else if(value > 0.875){
				retval = 'C5';
			}else if(value > 0.85){
				retval = 'A4';
			}else if(value > 0.825){
				retval = 'Ab4';
			}else if(value > 0.8){
				retval = 'G4';
			}else if(value > 0.75){
				retval = 'E4';
			}else if(value > 0.7){
				retval = 'Eb4';
			}else if(value > 0.65){
				retval = 'Db4';
			}else if(value > 0.6){
				retval = 'C4';
			}else if(value > 0.55){
				retval = 'A3';
			}else if(value > 0.5){
				retval = 'Ab3';
			}else if(value > .45){
				retval = 'G3';
			}else if(value > 0.4){
				retval = 'E3';
			}else if(value > 0.35){
				retval = 'Eb3';
			}else if(value > 0.30){
				retval = 'Db3';
			}else if(value > 0.25){
				retval = 'C3';
			}else if(value > 0.2){
				retval = 'A2';
			}else if(value > 0.15){
				retval = 'Ab2';
			}else if(value > 0.10){
				retval = 'G2';
			}else if(value > 0.08){
				retval = 'E2';
			}else if(value > 0.06){
				retval = 'Eb2';
			}else if(value > 0.04){
				retval = 'Db2';
			}else if(value > 0.02){
				retval = 'C2';
			}else if(value > 0.01){
				retval = 'A1';
			}else{
				retval = 'Ab1';
			}
		}
		return retval;
	}
	
	getPrecipNotes = (index) => {
		if(this.state.precipNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.precipNotes.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.precipNotes.slice(index);
		}
	}
	
	getPrecipNotes1 = (index) => {
		if(this.state.precipNotes1.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.precipNotes1.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.precipNotes1.slice(index);
		}
	}
	
	getPrecipNotes2 = (index) => {
		if(this.state.precipNotes2.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.precipNotes2.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.precipNotes2.slice(index);
		}
	}
	
	getTempNotes = (index) => {
		if(this.state.tempNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.tempNotes.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.tempNotes.slice(index);
		}
	}
	
	getTempNotes1 = (index) => {
		if(this.state.tempNotes1.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.tempNotes1.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.tempNotes1.slice(index);
		}
	}
	
	getTempNotes2 = (index) => {
		if(this.state.tempNotes2.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.tempNotes2.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.tempNotes2.slice(index);
		}
	}
	
	getIceNotes = (index) => {
		if(this.state.iceNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.iceNotes.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.iceNotes.slice(index);
		}
	}
	
	getIceNotes1 = (index) => {
		if(this.state.iceNotes1.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.iceNotes1.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.iceNotes1.slice(index);
		}
	}
	
	getIceNotes2 = (index) => {
		if(this.state.iceNotes2.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index >= this.state.iceNotes2.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.iceNotes2.slice(index);
		}
	}
			
	triggerNoteByVal = (type, val, index, data) => {
		Tone.Transport.start();
		const delay = Math.random() / 100;
		const plus = '+';
		const plusDelay = plus.concat(delay);
		const synth = this.getSynth(type);
		const note = this.getNote(type, val);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth.triggerAttackRelease(note, '16n', plusDelay);
		}, '+0');
		Tone.Transport.scheduleOnce((time) => {
			this.setState({notePlaying:0});
		}, '+8n');
		Tone.Transport.scheduleOnce((time) => {
			synth.dispose();
			Tone.Transport.cancel();
			Tone.Transport.stop();
		}, '+4n');
	}
	
	playNoteByVal = (type, val, index, data) => {
		const synth = this.getSynth(type);
		const delay = Math.random() / 100;
		const plus = '+';
		const plusDelay = plus.concat(delay);
		const note = this.getNote(type, val);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth.triggerAttackRelease(note, '16n', plusDelay);
		}, '+0');
		Tone.Transport.scheduleOnce((time) => {
			this.setState({notePlaying:0});
			synth.dispose();
		}, '+8n');
	}
	
	setupMapTransport = (e) => {
		Tone.Transport.start('+0');
		this.onMouseDown(e);
	}
	
	killMapTransport = (e) => {
    		Tone.Transport.cancel('+4n');
    		Tone.Transport.stop('+4n');
    		this.setState({notePlaying: 0});
    	}
    
    	killTransport = (e) => {
    		Tone.Transport.cancel('+4n');
    		Tone.Transport.stop('+4n');
    		this.setState({notePlaying: 0});
    	}
	
	getSynth = (type) => {
		var retsynth;
		if(type === 0){
			 retsynth = new Tone.FMSynth({
			 	modulation: {
			 		type: 'sine',
			 		frequency: 220
			 	},
			 	oscillator:{
			 		type: 'sine'
			 	},
			 	envelope: {
			 		attack: 0.05,
			 		decay: 0.2,
			 		sustain: 0.7,
			 		release: 1
			 	},
			 	volume: -4
			 }).toDestination();
		}
		else if(type === 1){
			 retsynth = new Tone.Synth({
			 	oscillator: {
			 		partials: [1, 0, 0.75, 0, 0.5, 0, 0.14, 0, 0.5, 0, 0.17, 0, 0.12]
			 	},
			 	envelope: {
			 		attack: 0.1,
			 		decay: 0.2,
			 		sustain: 0.9,
			 		release: 0.5
			 	},
			 	volume: -4
			 }).toDestination();
		}
		else if(type === 2){
			 retsynth = new Tone.FMSynth({
				"harmonicity": 3.01,
				"modulationIndex": 14,
				"oscillator": {
					"type": "triangle"
				},
				"envelope": {
					"attack": 0.2,
					"decay": 0.5,
					"sustain": 0.5,
					"release": 1,
				},
				"modulation" : {
					"type": "square"
				},
				"modulationEnvelope" : {
					"attack": 0.01,
					"decay": 0.5,
					"sustain": 0.2,
					"release": 0.1
				},
				volume: -4
			}).toDestination();
			//  retsynth.volume.value = 10;
		}
		return retsynth;
	}

	/*** Another increment method to work with tone ***/
	incrementIndex = () => {
		this.setupGraph();
		const { index } = this.state;
		if (index < 180) {
			this.setState({ index: index + 1 });
		} else {
			this.stopMusic(0);
		}
	}
    
    /*** onPress for 'moderato' ***/   
    setModerato = () => {
    	this.setState({
    		timerLen: 800
		});
		Tone.Transport.bpm.value = 200;
    }
    
    /*** onPress for 'allegro' ***/   
    setAllegro = () => {
    	this.setState({
    		timerLen: 400
    	});
		Tone.Transport.bpm.value = 240;
    }
    
    /*** onPress for 'presto' ***/   
    setPresto = () => {
    	this.setState({
    		timerLen: 200
		});
		Tone.Transport.bpm.value = 320;
    } 
    
    /*** handle year changes from the slider ***/
    handleYear = (event) => {
    	if(this.state.play === 0){
    		this.setState({
    			index: parseInt(event.target.value),
    			useArray: 3
    		});
    		this.setupGraph();
    	}
    }   
    
    callHome = () => {
    	const { navigation } = this.props;
    	if(this.state.play === 1){
    		this.stopMusic(1);
    	}
    	navigation.navigate('Home');
    }
      
    /*** clears and redraws rectangle around the graph area ***/ 
    setupGraph() {
    	const ctx = this.graphRef.current.getContext('2d');
        var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    	var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
    	var bottom = graphBottom - 1;
    	var right = modelWidth - 1;
    	
    	ctx.clearRect(0, 0, right, bottom);
    	
    	ctx.beginPath();
    	ctx.moveTo(1, 1);
    	ctx.lineTo(1, bottom);
    	ctx.lineTo(right, bottom);
    	ctx.lineTo(right, 1);
    	ctx.lineTo(1, 1);
    	ctx.strokeStyle = "black";
    	ctx.lineWidth = 1;
    	ctx.stroke();
    }
    
    /*** Called when the window is rotated on mobile ***/
    rotateDimensions = async () => {
    	await timer(1000);
    	window.scrollTo(0, 0);
    	window.resizeTo(this.state.pageBottom, this.state.pageRight);
    	window.focus();
    	this.updateDimensions();
    } 
 
    
    /*** Huge section of common styling, relies on the page size and what the DIVs are set at ***/
    getCommonStyles() {
    	var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
    	var modelHeight = Math.floor(this.state.pageBottom * this.state.MAPVERTDIV);

    	var controlWidth = this.state.pageRight * this.state.CONTROLDIV;
    	var controlHeight = this.state.pageBottom * this.state.CONTROLVERTDIV;
    	
    	var skinnyWidth = Math.floor(this.state.pageRight * this.state.SKINNYDIV);
    	
    	var smallFontSize = Math.floor(this.state.pageRight / 200 + this.state.pageBottom / 100);
    	var microFontSize = smallFontSize - 2;
    	var largeFontSize = Math.floor(this.state.pageRight / 160 + this.state.pageBottom / 80);
    	
    	const pageDiv = {
    		height: this.state.pageBottom,
    		width: this.state.pageRight,
    		padding: this.state.PADDING / 2
    	}
    	
    	/*** style for model images and div ***/
    	const modelStyle = {
		width: modelWidth,
		height: modelHeight
    	};
    
    	const containerStyle = {
    		height: this.state.pageBottom,
    		width: this.state.pageRight,
    		overflow: 'hidden'
    	};
    
    	const controlContainerStyle = {
    		height: Math.floor(controlHeight / 2),
    		width: Math.floor(this.state.pageRight * this.state.CONTROLDIV * this.state.CONTROLSPLIT),
    		float: 'left'
    	}
    	
    	const graphStyle = {
    		height: this.state.pageBottom * this.state.GRAPHVERTDIV,
    		width: modelWidth
    	};
    	
    	const sliderDivStyle = {
    		height: Math.floor(this.state.pageBottom * this.state.SLIDERVERTDIV),
    		width: modelWidth
    	};
    
    	const sliderStyle = {
    		height: Math.floor(this.state.pageBottom * this.state.SLIDERVERTDIV / 2) - this.state.PADDING,
    		width: '99%'
    	};
    
    	const controlDivStyle = {
    		height: controlHeight,
    		width: controlWidth,
    		overflow: 'hidden',
    		float: 'left',
    	};
    	
    	var playSplitDivStyle = {
    		height: Math.floor(controlHeight / (10)),
    		width: Math.floor(controlWidth * this.state.CONTROLSPLIT / 3),
    		overflow: 'hidden',
    		float: 'left',
    	};
    
    	var controlBlockStyle = {
    		height: Math.floor(controlHeight / (10)),
    		width: controlWidth * this.state.CONTROLSPLIT,
    		overflow: 'hidden',
    		float: 'left'
    	};
    	
    	const dataThirdStyle = {
    		width: Math.floor(modelWidth / 3),
    		height: Math.floor(this.state.pageBottom * this.state.DATAVERTDIV),
    		overflow: 'hidden',
    		float: 'left'
    	}
    
    	var dataBlockStyle = {
    	   	height: 3 * controlHeight / (40),
    		width: Math.floor(controlWidth * this.state.CONTROLSPLIT),
    		overflow: 'hidden',
    		float: 'left',
    		'textAlign': 'center'
    	}
    	
    	var keyContainer = {
    		width: Math.floor(this.state.pageRight * this.state.CONTROLDIV * this.state.CONTROLSPLIT),
    		height: Math.floor(this.state.pageBottom * this.state.CONTROLDVERTDIV * 3 / 20),
    		float: 'left',
    		overflow: 'hidden'
    	};
    	
    	var thirdControlStyle = {
    		height: Math.floor(controlHeight / 20),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3),
    		float: 'left'
    	};
    	
    	var dropdownControlStyle = {
    		height: Math.floor(controlHeight / (20)) - 1,
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT * 2 / 3),
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize
    	};
    	
    	var inputControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 5),
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize
    	};
    	
    	var labelControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 6) - 1,
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize,
    		'textAlign': 'right',
    		'paddingTop': 5
    	};
    	
    	var active = '#44CC44';
    	var inactive = '#DDDDDD';
    	var moderato = active;
    	var allegro = inactive;
    	var presto = inactive;
    
    	if(this.state.timerLen === 1200){
    		moderato = inactive;
    		allegro = inactive;
    		presto = inactive;
    	}
    	else if(this.state.timerLen === 800){
    		moderato = active;
    		allegro = inactive;
    		presto = inactive;
    	}
    	else if(this.state.timerLen === 400){
    		moderato = inactive;
    		allegro = active;
    		presto = inactive;
    	}
    	else if(this.state.timerLen === 200){
    		moderato = inactive;
    		allegro = inactive;
    		presto = active;
    	}
    	var moderatoHighlight = {
    		'backgroundColor': moderato,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif',
    		'padding': '8px',
    		'borderRadius': '8px',
    		'display': 'inline-block',
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 20,
    	};
    	var allegroHighlight = {
    		'backgroundColor': allegro,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif',
    		'padding': '8px',
    		'borderRadius': '8px',
    		'display': 'inline-block',
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 20,
    	};
    	var prestoHighlight = {
    		'backgroundColor': presto,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif',
    		'padding': '8px',
    		'borderRadius': '8px',
    		'display': 'inline-block',
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 20,
    	};
    
    	
    	if(this.state.CONTROLVERTDIV !== 1){
    	
    		playSplitDivStyle = {
    			height: Math.floor(controlHeight / (10 * (1 - this.state.CONTROLVERTDIV))),
    			width: Math.floor(controlWidth * this.state.CONTROLSPLIT / 3),
    			overflow: 'hidden',
    			float: 'left',
    		};
    
    		controlBlockStyle = {
    			height: Math.floor(controlHeight / (10 * (1 - this.state.CONTROLVERTDIV))),
    			width: controlWidth * this.state.CONTROLSPLIT,
    			overflow: 'hidden',
    			float: 'left'
    		};
    
    		dataBlockStyle = {
    	   		height: 3 * controlHeight / (40 * (1 - this.state.CONTROLVERTDIV)),
    			width: Math.floor(controlWidth * this.state.CONTROLSPLIT),
    			overflow: 'hidden',
    			float: 'left',
    			'textAlign': 'center'
    		};
    		keyContainer = {
    			width: Math.floor(this.state.pageRight * this.state.CONTROLDIV * this.state.CONTROLSPLIT),
    			height: Math.floor(this.state.pageBottom * this.state.CONTROLDVERTDIV * 1 / (2 * 1 - this.state.CONTROLVERTDIV)),
    			float: 'left',
    			overflow: 'hidden'
    		};
    		thirdControlStyle = {
    			height: Math.floor(3 * controlHeight / 40),
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3),
    			float: 'left'
    		};
    		
    		dropdownControlStyle = {
    			height: Math.floor(3 * controlHeight / (40)),
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT * 2 / 3),
    			float: 'left',
    			'fontFamily': 'Verdana, sans-serif',
    			"fontSize": smallFontSize
    		};
    		
    		inputControlStyle = {
    			height: Math.floor(3 * controlHeight / (40)),
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 5),
    			float: 'left',
    			'fontFamily': 'Verdana, sans-serif',
    			"fontSize": smallFontSize
    		};
    	
    		labelControlStyle = {
    			height: Math.floor(3 * controlHeight / (40)),
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 6) - 1,
    			float: 'left',
    			'fontFamily': 'Verdana, sans-serif',
    			"fontSize": smallFontSize,
    			'textAlign': 'right',
   	 		'paddingTop': 5
    		};
    		moderatoHighlight = {
    			'backgroundColor': moderato,
    			'fontSize': microFontSize,
    			'fontFamily': 'Verdana, sans-serif',
    			'padding': '1px',
    			'borderRadius': '1px',
    			'display': 'inline-block',
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 5
    		};
    		allegroHighlight = {
    			'backgroundColor': allegro,
    			'fontSize': microFontSize,
   	 		'fontFamily': 'Verdana, sans-serif',
    			'padding': '1px',
    			'borderRadius': '1px',
    			'display': 'inline-block',
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 5
    		};
    		prestoHighlight = {
    			'backgroundColor': presto,
    			'fontSize': microFontSize,
    			'fontFamily': 'Verdana, sans-serif',
    			'padding': '1px',
    			'borderRadius': '1px',
    			'display': 'inline-block',
    			width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 5
    		};
    	
    	}
    	
    	const graphBufferStyle = {
    		width: Math.floor(modelWidth),
    		height: Math.floor(this.state.pageBottom * this.state.DATAVERTDIV),
    		float: 'left',
    		overflow: 'hidden'
    	}
    
    	const instructionTextStyle = {
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": largeFontSize,
    		'display': 'inline'
    	};
    	
    	const paragraphTextStyle = {
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize
    	};
    
    	const smallLabelTextStyle = {
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize
    	};
    
    	const quarterControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3),
    		float: 'left',
    		'textAlign': 'center'
    	};
    	
    	const halfControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 2),
    		float: 'left',
    		'textAlign': 'center'
    	};
    	
    	const bigLabelControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3) - 1,
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize,
    		'textAlign': 'right',
    		'paddingTop': 5
    	};
    	
    	const skinnyDivStyle = {
    		height: this.state.pageBottom * this.state.MAPVERTDIV,
    		width: skinnyWidth,
    		overflow: 'hidden',
    		float:'left'
    	};
    
    	const largeDivStyle = {
    		height: this.state.pageBottom,
    		width: modelWidth,
    		overflow: 'hidden',
    		float: 'left'
    	};

    	const skinnyImgStyle = {
    		height: this.state.pageBottom * this.state.MAPVERTDIV / 2,
    		width: skinnyWidth,
    		overflow: 'hidden'
    	};
    
    	
    	return ({ pageDiv, modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, halfControlStyle, inputControlStyle, bigLabelControlStyle, labelControlStyle, dropdownControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer, dataThirdStyle });
    }
    
    /*** These should never run because each class has separate functions,
    *** but these are here to keep react from complaining ***/
    componentDidMount = () => {
    	console.log("class fail");
    }
    
    componentWillUnmount = () => {
    	console.log("class fail");
    }

    render(){
    	return(<p>Class Failed to load Properly</p>);
    }
}
