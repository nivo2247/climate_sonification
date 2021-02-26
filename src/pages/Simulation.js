import { Image } from "react-native";
import * as React from 'react';
import { PADDING, Page } from './Page.js';
import { dbUrl } from './../const/url.js'
import Axios from 'axios';

/*** Links to AWS S3 media ***/
const playUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png";
const pauseUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/stop.png";

/* used to wait a certain amount of ms */
const timer = ms => new Promise(res => setTimeout(res, ms));

/*** Index Handler Block (recieves Class as state)  ***/
export var indexIncrementer = async function(msg, data) {
	/* if simulation is in play state, increment until 180 */
	if (data.state.play == 1){
		while(data.state.index < 180){
			if(data.state.play == 1){
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
* convert those to textboxes and check val */
function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

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
		useArray: 0
    	};
    }  

    /*** onPress for 'adagio' ***/       
    setAdagio = () => {
    	this.setState({
    		timerLen: 1200
    		});
    }
    
    /*** onPress for 'moderato' ***/   
    setModerato = () => {
    	this.setState({
    		timerLen: 800
		});
    }
    
    /*** onPress for 'allegro' ***/   
    setAllegro = () => {
    	this.setState({
    		timerLen: 400
    		});
    }
    
    /*** onPress for 'presto' ***/   
    setPresto = () => {
    	this.setState({
    		timerLen: 200
		});
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
			GRAPHVERTDIV: 2 / 10,
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
			GRAPHVERTDIV: 2 / 10,
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
    	var modelLeft = Math.floor(this.state.pageRight * (1 - this.state.MAPDIV));
    	var modelDiv = Math.floor(this.state.pageRight * this.state.MAPDIV / 3);
    	var modelSplit = Math.floor(this.state.pageBottom * this.state.MAPVERTDIV / 2);
    	
    	var controlWidth = this.state.pageRight * this.state.CONTROLDIV;
    	var controlHeight = this.state.pageBottom * this.state.CONTROLVERTDIV;
    	
    	var skinnyWidth = Math.floor(this.state.pageRight * this.state.SKINNYDIV);
    	
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
    	
    	if(this.state.CONTROLVERTDIV != 1){
    	
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
    			height: Math.floor(this.state.pageBottom * this.state.CONTROLDVERTDIV * 3 / (20 * 1 - this.state.CONTROLVERTDIV)),
    			float: 'left',
    			overflow: 'hidden'
    		};
    	
    	}
    
    	const instructionTextStyle = {
    		"font-size": "10px"
    	};
    	
    	const paragraphTextStyle = {
    		"font-size": "8px"
    	};
    
    	const smallLabelTextStyle = {
    		"font-size": "10px"
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
    
    	if(this.state.timerLen == 1200){
    		adagio = active;
    		moderato = inactive;
    		allegro = inactive;
    		presto = inactive;
    	}
    	else if(this.state.timerLen == 800){
    		adagio = inactive;
    		moderato = active;
    		allegro = inactive;
    		presto = inactive;
    	}
    	else if(this.state.timerLen == 400){
    		adagio = inactive;
    		moderato = inactive;
    		allegro = active;
    		presto = inactive;
    	}
    	else if(this.state.timerLen == 200){
    		adagio = inactive;
    		moderato = inactive;
    		allegro = inactive;
    		presto = active;
    	}
    	const adagioHighlight = {
    		'background-color': adagio,
    		'font-size': '10px'
    	};
    	const moderatoHighlight = {
    		'background-color': moderato,
    		'font-size': '10px'
    	};
    	const allegroHighlight = {
    		'background-color': allegro,
    		'font-size': '10px'
    	};
    	const prestoHighlight = {
    		'background-color': presto,
    		'font-size': '10px'
    	};
    
    	return ({ modelWidth, modelHeight, modelLeft, modelDiv, modelSplit, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer });
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
