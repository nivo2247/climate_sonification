import * as React from 'react';
import * as Tone from 'tone';
import { PADDING, Page } from './Page.js';
import { playUrl } from './../const/url.js';

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
	
	getValByIndex = (arr, ind) => {
		var avgKeys = Object.keys(arr[0]);
    		var useAvgKey = avgKeys[ind+2];
    		var val = arr[0][useAvgKey];
    		return val;
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
    			note = this.getNoteByVal(0, precip_val, i, data);
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
		
		for(var i = 0; i < 181; i++){
    			temp_val = this.getValByIndex(data, i);
    			note = this.getNoteByVal(1, temp_val, i, data);
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
		
		for(var i = 0; i < 181; i++){
    			ice_val = this.getValByIndex(data, i);
    			note = this.getNoteByVal(2, ice_val, i, data);
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
			return this.state.precipNotes.slice(index);
		}
	}
	
	getTempNotes = (index) => {
		if(this.state.precipNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			return this.state.tempNotes.slice(index);
		}
	}
	
	getIceNotes = (index) => {
		if(this.state.precipNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			return this.state.iceNotes.slice(index);
		}
	}
	
	getNoteByVal(type, val, index, data){
		var scale = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'A4'];
		if(index > 100){
			scale = ['G5', 'A5', 'A#5', 'C5', 'D5', 'D#5', 'F5', 'G4'];
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
    				if(rand <= 0.33){
					return scale[7];
				}else if(rand <= 0.67){
					return scale[0];
				}else{
					return scale[4];
				}
			}else if(diff < 50){
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
	
	triggerNoteByVal = (type, val, index, data) => {
		Tone.Transport.start();
		const synth = this.getSynth(type);
		//synth.sync();
		const note = this.getNoteByVal(type, val, index, data);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth.triggerAttackRelease(note, '8n');
		}, '+0');
		Tone.Transport.scheduleOnce((time) => {
			synth.dispose();
			Tone.Transport.cancel();
			Tone.Transport.stop();
			this.setState({notePlaying:0});
		}, '+4n');
	}
	
	playNoteByVal = (type, val, index, data) => {
		const synth = this.getSynth(type);
		//synth.sync();
		const note = this.getNoteByVal(type, val, index, data);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth.triggerAttackRelease(note, '8n');
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
			 retsynth = new Tone.FMSynth().toDestination();
		}
		else if(type === 1){
			 retsynth = new Tone.FMSynth().toDestination();
			 retsynth.volume.value = 5;
		}
		else if(type === 2){
			 retsynth = new Tone.AMSynth().toDestination();
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

    /*** onPress for 'adagio' ***/       
    setAdagio = () => {
    	this.setState({
    		timerLen: 1200
    	});
		// Might need to stop the music to
		// avoid bugs
		Tone.Transport.bpm.value = 70;
    }
    
    /*** onPress for 'moderato' ***/   
    setModerato = () => {
    	this.setState({
    		timerLen: 800
		});
		Tone.Transport.bpm.value = 110;
    }
    
    /*** onPress for 'allegro' ***/   
    setAllegro = () => {
    	this.setState({
    		timerLen: 400
    	});
		Tone.Transport.bpm.value = 140;
    }
    
    /*** onPress for 'presto' ***/   
    setPresto = () => {
    	this.setState({
    		timerLen: 200
		});
		Tone.Transport.bpm.value = 180;
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
    
    /*** called when the window is resized ***/
    updateDimensions = () => {
    	var newheight = window.innerHeight;
    	var newwidth = window.innerWidth;
    	
    	if(window.innerHeight < window.innerWidth){
    		this.setState({
    			pageBottom: newheight - PADDING,
    			pageRight: newwidth - PADDING,
    			CONTROLDIV: 2 / 10,
			SKINNYDIV: 1 / 20,
			MAPDIV: 3 / 4,
			MAPVERTDIV: 7 / 10,
			DATAVERTDIV: 1 / 20,
			GRAPHVERTDIV: 3 / 20,
			SLIDERVERTDIV: 1 / 10,
			CONTROLVERTDIV: 1,
			CONTROLSPLIT: 1
    		});
    	}
    	else{
    		this.setState({
    			pageBottom: newheight - PADDING,
    			pageRight: newwidth - PADDING,
    			CONTROLDIV: 1,
			SKINNYDIV: 1 / 20,
			MAPDIV: 19 / 20,
			MAPVERTDIV: 7 / 20,
			DATAVERTDIV: 1 / 20,
			GRAPHVERTDIV: 3 / 20,
			SLIDERVERTDIV: 1 / 10,
			CONTROLVERTDIV: 4 / 10,
			CONTROLSPLIT: 1 / 2
    		});
    	}	
    	this.setupGraph();
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
    
    	var dataBlockStyle = {
    	   	height: controlHeight / (20),
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
    	   		height: controlHeight / (20 * (1 - this.state.CONTROLVERTDIV)),
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
    	
    	const inputControlStyle = {
    		height: Math.floor(controlHeight / (20)) - 1,
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 5),
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize
    	};
    	
    	const dropdownControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT * 3 / 4),
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize
    	};
    	
    	const bigLabelControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 4) - 1,
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize,
    		'textAlign': 'right',
    		'paddingTop': 5
    	};
    	
    	const labelControlStyle = {
    		height: Math.floor(controlHeight / (20)),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 6) - 1,
    		float: 'left',
    		'fontFamily': 'Verdana, sans-serif',
    		"fontSize": smallFontSize,
    		'textAlign': 'right',
    		'paddingTop': 5
    	};
    
    	const thirdControlStyle = {
    		height: Math.floor(controlHeight / 20),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 3),
    		float: 'left'
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
    	var adagio = inactive;
    	var moderato = active;
    	var allegro = inactive;
    	var presto = inactive;
    
    	if(this.state.timerLen === 1200){
    		adagio = active;
    		moderato = inactive;
    		allegro = inactive;
    		presto = inactive;
    	}
    	else if(this.state.timerLen === 800){
    		adagio = inactive;
    		moderato = active;
    		allegro = inactive;
    		presto = inactive;
    	}
    	else if(this.state.timerLen === 400){
    		adagio = inactive;
    		moderato = inactive;
    		allegro = active;
    		presto = inactive;
    	}
    	else if(this.state.timerLen === 200){
    		adagio = inactive;
    		moderato = inactive;
    		allegro = inactive;
    		presto = active;
    	}
    	const adagioHighlight = {
    		'backgroundColor': adagio,
    		'fontSize': microFontSize,
    		'fontFamily': 'Verdana, sans-serif'
    	};
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
    
    	return ({ modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, halfControlStyle, inputControlStyle, bigLabelControlStyle, labelControlStyle, dropdownControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer });
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
