import * as React from 'react';
import * as Tone from 'tone';
import { PADDING, Page } from './Page.js';

/*** Links to AWS S3 media ***/
const playUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png";
const pauseUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/stop.png";

/* used to wait a certain amount of ms */
const timer = ms => new Promise(res => setTimeout(res, ms));

/*** Index Handler Block (recieves Class as state)  ***/
export var indexIncrementer = async function(msg, data) {
	/* if simulation is in play state, increment until 180 */
	if (data.state.play === 1){
		while(data.state.index < 180){
			if(data.state.play === 1){
				data.setupGraph();
    				data.setState({
    					index: data.state.index+1, 
    					playButton: pauseUrl
   				});
   				await timer(data.state.timerLen);
   			}else{
   					return;
   			}
   		}
   		/* Stop at index 180 */
   		data.setupGraph();
   		data.setState({
    			playButton: playUrl,
    			play: 0,
    			useArray: 3
    			
    		});
	}
	/* This else is used when the simulation is stopped */
	else {
		data.setupGraph();
    		data.setState({
    			playButton: playUrl
    		});
    	}
};

/* TODO: Implement this with latitude, longitude, and year,
* convert those to textboxes and check val 
function isNumeric(value) {
	return /^-?\d+$/.test(value);
}
*/

const synth = new Tone.Synth().toDestination();

// I'm not sure if we need this inside the class or not
// it seems like we shouldn't.  In the long term we should
// consider a sampler, or at least build a synth in a separate
// file and import it.
// const synth = new Tone.Synth.toDestination();

/*** Shared class for EachAlone and AllTogether class ***/
export class Simulation extends Page {

	constructor(props){
	    super(props)
	    this.state = {
			pageBottom: window.clientHeight - PADDING,
			pageRight: window.clientWidth - PADDING,
			index: 0,
			play: 0,
			timerLen: 800,
			playButton: playUrl,
			co2data : [0],
			token: "",
			latitude: 0,
			longitude: 0,
			CONTROLDIV: 2 / 10,
			CONTROLVERTDIV: 1,
			SKINNYDIV: 1 / 20,
			MAPDIV: 3 / 4,
			MAPVERTDIV: 3 / 4,
			GRAPHVERTDIV: 2 / 10,
			SLIDERVERTDIV: 1 / 20,
			CONTROLSPLIT: 1,
			useArray: 0,
			audioAvailable: false,
			precipNotes: []
	    };
		// I'm pretty sure I need to bind the index incrementer
		this.incrementIndex = this.incrementIndex.bind(this);
	}  
	
	setPrecipNotes = (data) => {
		var precipNoteArr = [];
		var scale = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'A4'];
		var precipAvgKeys, usePrecipAvgKey, precip_val;
		
		console.log("data", data);
		
		for(var i = 0; i < 181; i++){
			precipAvgKeys = Object.keys(data[0]);
    			usePrecipAvgKey = precipAvgKeys[i+2];
    			precip_val = data[0][usePrecipAvgKey];
    			if(precip_val < 100){
				precipNoteArr.push(scale[7]);
				console.log("small val");
			}else if(precip_val < 150){
				precipNoteArr.push(scale[4]);
			}else if(precip_val < 200){
				precipNoteArr.push(scale[0]);
			}else{
				precipNoteArr.push(scale[2]);
			}
		}
		
		this.setState({
			precipNotes: [...precipNoteArr]
		});
	}
	
	getPrecipNotes = (index) => {
		if(this.state.precipNotes.length === 0){
			return ['C5', 'D5', 'F5', 'G5'];
		}else{
			return this.state.precipNotes.slice(index);
		}
	}

	/*** Run this when stop is pressed or when index === 180 ***/
	stopMusic = () => {
		this.setState({ play: 0, playButton: playUrl });
		// Maybe I need to also stop the sequence?
		Tone.Transport.stop();
		Tone.Transport.cancel(0);
	}

	/*** Run this when play button is pressed
	 * A few modifications for the real thing:
	 * 	- use Sequence instead of Pattern
	 * 	- determine start based on index, may need to
	 * 	slice to make this work.  But should first see
	 * 	if this can be accomplished using pause rather
	 * 	than stop.
	 ****/	
	playMusic = () => {
		this.setState( { play: 1, playButton: pauseUrl, useArray: 3 });
		// TODO: replace this with music generated from data
		// should be done in a separate loadMusic method
		const testPattern = new Tone.Pattern((time, note) => {
			synth.triggerAttackRelease(note, '8n', time);
			// will need to increment, so I need to bind the
			// incrementing function
			Tone.Draw.schedule(() => {
				this.incrementIndex();
			}, time)
		}, this.getPrecipNotes(this.state.index), 'up');

		// this is kind of a guess to be honest
		if(this.state.audioAvailable) {
			testPattern.start(0);
			Tone.Transport.start('+0.1');
		} else {
			Tone.start().then(() => {
				this.setState({ audioAvailable: true })
				testPattern.start(0);
				Tone.Transport.start('+0.1');
			}).catch(error => console.error(error));
		}
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
    	this.setupGraph();
    	this.setState({
    		index: parseInt(event.target.value),
    		useArray: 3
    	});
    }       
      
    /*** clears and redraws rectangle around the graph area ***/ 
    setupGraph() {
    	const ctx = this.refs.models.getContext('2d');
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
    
    /*** called when the window is resized ***/
    updateDimensions = () => {
    	if(window.innerHeight < window.innerWidth){
    		this.setState({
    			pageBottom: window.innerHeight - PADDING,
    			pageRight: window.innerWidth - PADDING,
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
    			pageBottom: window.innerHeight - PADDING,
    			pageRight: window.innerWidth - PADDING,
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
    		float: 'left'
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
    			float: 'left'
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
    		'font-family': 'Verdana, sans-serif',
    		"font-size": largeFontSize,
    		'display': 'inline'
    	};
    	
    	const paragraphTextStyle = {
    		'font-family': 'Verdana, sans-serif',
    		"font-size": smallFontSize
    	};
    
    	const smallLabelTextStyle = {
    		'font-family': 'Verdana, sans-serif',
    		"font-size": smallFontSize
    	};
    
    	const quarterControlStyle = {
    		height: controlHeight / (20),
    		width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 4),
    		float: 'left'
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
    		'background-color': adagio,
    		'font-size': microFontSize,
    		'font-family': 'Verdana, sans-serif'
    	};
    	const moderatoHighlight = {
    		'background-color': moderato,
    		'font-size': microFontSize,
    		'font-family': 'Verdana, sans-serif'
    	};
    	const allegroHighlight = {
    		'background-color': allegro,
    		'font-size': microFontSize,
    		'font-family': 'Verdana, sans-serif'
    	};
    	const prestoHighlight = {
    		'background-color': presto,
    		'font-size': microFontSize,
    		'font-family': 'Verdana, sans-serif',
    	};
    
    	return ({ modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer });
    }
    
    /*** Templates for functions which would change the text of lat and lon from textbox input ***/
    onChangeLat = (text) => {
    	//implement isnumeric check
    }
    
    onChangeLon = (text) => {
    	//implement isnumeric check
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
