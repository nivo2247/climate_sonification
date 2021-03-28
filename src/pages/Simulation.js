import * as React from 'react';
import * as Tone from 'tone';
import { PADDING, Page } from './Page.js';
import { playUrl, loading } from './../const/url.js';
import { getInfo } from './../const/cities.js';

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
		this.state.pageBottom = window.clientHeight - PADDING;
		this.state.pageRight = window.clientWidth - PADDING;
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
	
      changeToCity = (event) => {
      	if(this.state.play === 0){
    	var city = event.target.value;
    	var cityinfo = getInfo(city);
    	var lat = cityinfo.latitude;
    	var lon = cityinfo.longitude;
    	this.doCoordHits(lat, lon);
    	this.setState({
    		latitude: lat,
    		longitude: lon,
    		useArray: 0
    	});
    	this.setupGraph();
    	this.triggerNotes(lat, lon);
    	}
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
		var prevnote = 'C4';
		
		for(var i = 0; i < 181; i++){
    			precip_val = this.getValByIndex(data, i);
    			note = this.getArp(0, precip_val, i, data, prevnote);
    			prevnote = note;
    			precipNoteArr.push(note)
		}
		
		this.setState({
			precipNotes: [...precipNoteArr]
		});
	}
	
	setTempNotes = (data) => {
		var tempNoteArr = [];
		var temp_val;
		var note;
		var prevnote = 'C4';
		
		for(var i = 0; i < 181; i++){
    			temp_val = this.getValByIndex(data, i);
    			note = this.getArp(1, temp_val, i, data, prevnote);
    			prevnote = note;
    			tempNoteArr.push(note);
    			
		}
		
		this.setState({
			tempNotes: [...tempNoteArr]
		});
	}
	
	setIceNotes = (data) => {
		var iceNoteArr = [];
		var ice_val;
		var note;
		var prevnote = 'C4';
		
		for(var i = 0; i < 181; i++){
    			ice_val = this.getValByIndex(data, i);
    			note = this.getArp(2, ice_val, i, data, prevnote);
    			prevnote = note;
    			iceNoteArr.push(note);
		}
		
		this.setState({
			iceNotes: [...iceNoteArr]
		});
	}
	
	getPrecipNotes = (index) => {
		if(this.state.precipNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index + 1 >= this.state.precipNotes.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.precipNotes.slice(index + 1);
		}
	}
	
	getTempNotes = (index) => {
		if(this.state.tempNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index + 1 >= this.state.tempNotes.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.tempNotes.slice(index + 1);
		}
	}
	
	getIceNotes = (index) => {
		if(this.state.iceNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			if(index + 1 >= this.state.iceNotes.length){
				return ['C5', 'D5', 'F5', 'G5'];
			}
			return this.state.iceNotes.slice(index + 1);
		}
	}
	
	getNoteByVal(type, val, index, data){
		var scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'A2', 'B2', 'C2'];
		if(index > 94 && index < 122){
			scale = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'A2'];
		}
		else if(index < 139){
			scale = ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab3', 'Bb3', 'C3', 'D3', 'Eb3', 'F3', 'G3', 'Ab2', 'Bb2', 'C2'];
		}
		else if(index < 153){
			scale = ['A4', 'B4', 'Cb4', 'D4', 'E4', 'Fb4', 'Gb4', 'A3', 'B3', 'Cb3', 'D3', 'E3', 'Fb3', 'Gb3', 'A2'];
		}
		else if(index < 165){
			scale = ['D4', 'Eb4', 'F4', 'G4', 'A3', 'Bb3', 'C3', 'D3', 'Eb3', 'F3', 'G3', 'A2', 'Bb2', 'C2'];
		}
		else if(index < 176){
			scale = ['Bb4', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A3', 'Bb3', 'C3', 'D3', 'Eb3', 'F3', 'G3', 'A2', 'Bb2'];
		}else{
			scale = ['G4', 'A4', 'Bb4', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A3', 'Bb3', 'C3', 'D3', 'Eb3', 'F3', 'G3'];
		}
		var rand = Math.random();
		if(type === 0){
    			var precip_val = val;
    			var prev_val = 100;
    			if(index !== 0){
    				prev_val = this.getValByIndex(data, index - 1)
    			}
    			var diff = Math.abs(precip_val - prev_val);
    			if(diff < 10){
    				if(rand <= 0.25){
					return scale[0];
				}else if(rand <= 0.5){
					return scale[2];
				}else if(rand <= 0.75){
					return scale[4];
				}else{
					return scale[7];
				}
			}else if(diff < 50){
				if(rand <= 0.25){
					return scale[6];
				}else if(rand <= 0.5){
					return scale[3];
				}else if(rand <= 0.75){
					return scale[13];
				}else{
					return scale[10];
				}
			}else{
				if(rand <= 0.25){
					return scale[6];
				}else if(rand <= 0.5){
					return scale[1];
				}else if(rand <= 0.75){
					return scale[13];
				}else{
					return scale[8];
				}
			}
		}
		else if(type === 1){
			var temp_val = val;
    			
    			if(temp_val < 1){
    				if(rand <= 0.33){
					return scale[7];
				}else if(rand <= 0.67){
					return scale[0];
				}else{
					return scale[4];
				}
			}else if(temp_val < 2){
				if(rand <= 0.5){
					return scale[6];
				}else{
					return scale[3];
				}
			}else{
				if(rand <= 0.5){
					return scale[6];
				}else{
					return scale[1];
				}
			}
		}
		else if(type === 2){
			var ice_val = val;
    			
    			if(ice_val >= .95){
    				if(rand <= 0.33){
					return scale[7];
				}else if(rand <= 0.67){
					return scale[0];
				}else{
					return scale[4];
				}
			}else if(ice_val < 0.8){
				if(rand <= 0.5){
					return scale[6];
				}else{
					return scale[3];
				}
			}else{
				if(rand <= 0.5){
					return scale[6];
				}else{
					return scale[1];
				}
			}
		}
		return 'C5';
	}
	
	getArp(type, val, index, data, prevnote){
		var scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
		if(index > 94 && index< 122){
			scale = ['F4', 'G4', 'A4', 'Bb4', 'C4', 'D4', 'E4'];
		}else if(index < 139){
			scale = ['Bb4', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4'];
		}else if(index < 153){
			scale = ['Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C4', 'D4'];
		}else if(index < 165){
			scale = ['Ab4', 'Bb4', 'C4', 'Db4', 'Eb4', 'F4', 'G4'];
		}else if(index < 176){
			scale = ['Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4', 'C4'];
		}else{
			scale = ['Gb4', 'Ab4', 'Bb4', 'Cb4', 'Db4', 'Eb4', 'F4'];
		}
		var prevind = scale.indexOf(prevnote);
		if(prevind === -1){
			prevind = 0;
		}
		var nextind, prev_val, diff;
		if(type === 0){
    			var precip_val = val;
    			prev_val = 100;
    			if(index !== 0){
    				prev_val = this.getValByIndex(data, index - 1)
    			}
    			diff = precip_val - prev_val;
    			if(diff >= 0){
    				nextind = (prevind + 1) % scale.length;
    				return scale[nextind];
			}else{
				nextind = (prevind - 1);
				if(nextind < 0){
					nextind = scale.length - 1;
				}
				return scale[nextind];
			}
		}
		else if(type === 1){
			var temp_val = val;
    			
    			prev_val = 0;
    			if(index !== 0){
    				prev_val = this.getValByIndex(data, index - 1)
    			}
    			diff = temp_val - prev_val;
    			if(diff > 0){
    				nextind = (prevind + 1) % scale.length;
    				return scale[nextind];
			}else if(diff === 0){
				return prevnote;
			}else{
				nextind = (prevind - 1);
				if(nextind < 0){
					nextind = scale.length - 1;
				}
				return scale[nextind];
			}
		}
		else if(type === 2){
			var ice_val = val;
    			
    			prev_val = 1;
    			if(index !== 0){
    				prev_val = this.getValByIndex(data, index - 1)
    			}
    			diff = ice_val - prev_val;
    			if(diff >= 0){
    				nextind = (prevind + 1) % scale.length;
    				return scale[nextind];
			}else{
				nextind = (prevind - 1);
				if(nextind < 0){
					nextind = scale.length - 1;
				}
				return scale[nextind];
			}
		}
		return 'C5';
	}
	
	triggerNoteByVal = (type, val, index, data) => {
		Tone.Transport.start();
		const delay = Math.random() / 100;
		const plus = '+';
		const plusDelay = plus.concat(delay);
		const synth = this.getSynth(type);
		const note = this.getNoteByVal(type, val, index, data);
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
		const note = this.getNoteByVal(type, val, index, data);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth.triggerAttackRelease(note, '16n', plusDelay);
		}, '+0');
		Tone.Transport.scheduleOnce((time) => {
			this.setState({notePlaying:0});
		}, '+8n');
		Tone.Transport.scheduleOnce((time) => {
			synth.dispose();
		}, '+4n');
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
			 	}
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
			 	}
			 }).toDestination();
		}
		else if(type === 2){
			 retsynth = new Tone.FMSynth({
			 	modulation: {
			 		type: 'sawtooth',
			 		detune: 7,
			 		modulation: {
			 			type: 'sawtooth',
			 			detune: 13,
			 			modulation: {
			 				type: 'sawtooth',
			 				detune: 29
			 			}
			 		}
			 	},
			 	oscillator:{
			 		type: 'sawtooth'
			 	},
			 	envelope: {
			 		attack: 1,
			 		decay: 0.1,
			 		sustain: 0.8,
			 		release: 1
			 	},
			 	volume: -5
			 }).toDestination();
			 retsynth.volume.value = 10;
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
			this.stopMusic();
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
    		this.stopMusic();
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
    		height: Math.floor(this.state.pageBottom * this.state.SLIDERVERTDIV / 2) - PADDING,
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
    		width: Math.floor(controlWidth * this.state.CONTROLSPLIT / 2),
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
    	
    	if(this.state.CONTROLVERTDIV !== 1){
    	
    		playSplitDivStyle = {
    			height: Math.floor(controlHeight / (10 * (1 - this.state.CONTROLVERTDIV))),
    			width: Math.floor(controlWidth * this.state.CONTROLSPLIT / 2),
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
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 4),
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
    	const moderatoHighlight = {
    		'backgroundColor': moderato,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif'
    	};
    	const allegroHighlight = {
    		'backgroundColor': allegro,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif'
    	};
    	const prestoHighlight = {
    		'backgroundColor': presto,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif',
    	};
    
    	return ({ modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, halfControlStyle, inputControlStyle, bigLabelControlStyle, labelControlStyle, dropdownControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer, dataThirdStyle });
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
