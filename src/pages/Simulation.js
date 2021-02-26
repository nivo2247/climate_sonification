import { Dimensions, Image } from "react-native";
import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { precipImgs, tempImgs, iceImgs, dbUrl } from './../const/url.js';


/*** Links to AWS S3 media ***/
const playUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png";
const pauseUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/stop.png";

const PADDING = 5;

/*** Div splits from left to right. Should add up to 1 ***/


/*** Index Handler Block (recieves page state):  
***  if play=1, increment index with delay in loop
***  else interrupt loop			 ***/

const timer = ms => new Promise(res => setTimeout(res, ms));

export var indexIncrementer = async function(msg, data) {
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
   		data.setupGraph();
   		data.setState({
    			playButton: playUrl,
    			play: 0,
    			useArray: 3
    			
    		});
	}
	else {
		data.setupGraph();
    		data.setState({
    			playButton: playUrl
    		});
    	}
};

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

/*** Page class ***/
export class Simulation extends React.Component {
    constructor(props){
    super(props)
        this.state = {
    		index: 0,
    		play: 0,
    		timerLen: 800,
    		playButton: playUrl,
    		co2data : [0],
    		token: "",
    		latitude: 0,
    		longitude: 0,
    		pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING,
    		CONTROLDIV: 2 / 10,
    		CONTROLVERTDIV: 1,
		SKINNYDIV: 1 / 20,
		MAPDIV: 3 / 4,
		MAPVERTDIV: 3 / 4,
		GRAPHVERTDIV: 2 / 10,
		SLIDERVERTDIV: 1 / 20,
		CONTROLDIVFLOAT: 'left',
		MAPDIVFLOAT: 'right',
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
    
    handleYear = (event) => {
    	this.setupGraph();
    	this.setState({
    		index: parseInt(event.target.value),
    		useArray: 3
    	});
    }       
    
    updateDimensions = () => {
    if(Dimensions.get('window').height < Dimensions.get('window').width){
    	this.setState({
    		pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING,
    		CONTROLDIV: 2 / 10,
		SKINNYDIV: 1 / 20,
		MAPDIV: 3 / 4,
		MAPVERTDIV: 3 / 4,
		GRAPHVERTDIV: 2 / 10,
		SLIDERVERTDIV: 1 / 20,
		CONTROLDIVFLOAT: 'left',
		MAPDIVFLOAD: 'right',
		CONTROLVERTDIV: 1,
		CONTROLSPLIT: 1
    	});
    }
    else{
    	this.setState({
    		pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING,
    		CONTROLDIV: 1,
		SKINNYDIV: 1 / 20,
		MAPDIV: 19 / 20,
		MAPVERTDIV: 1 / 4,
		GRAPHVERTDIV: 1 / 5,
		SLIDERVERTDIV: 1 / 20,
		CONTROLDIVFLOAT: 'right',
		MAPDIVFLOAT: 'left',
		CONTROLVERTDIV: 1 / 2,
		CONTROLSPLIT: 1 / 2
    	});
    }	
    this.setupGraph();
    } 
    
    rotateDimensions = async () => {
    await timer(1000);
    if(Dimensions.get('window').height < Dimensions.get('window').width){
    	this.setState({
    		pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING,
    		CONTROLDIV: 2 / 10,
		SKINNYDIV: 1 / 20,
		MAPDIV: 3 / 4,
		MAPVERTDIV: 3 / 4,
		GRAPHVERTDIV: 2 / 10,
		SLIDERVERTDIV: 1 / 20,
		CONTROLDIVFLOAT: 'left',
		MAPDIVFLOAD: 'right',
		CONTROLVERTDIV: 1,
		CONTROLSPLIT: 1
    	});
    }
    else{
    	this.setState({
    		pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING,
    		CONTROLDIV: 1,
		SKINNYDIV: 1 / 20,
		MAPDIV: 19 / 20,
		MAPVERTDIV: 1 / 4,
		GRAPHVERTDIV: 1 / 5,
		SLIDERVERTDIV: 1 / 20,
		CONTROLDIVFLOAT: 'right',
		MAPDIVFLOAT: 'left',
		CONTROLVERTDIV: 1 / 2,
		CONTROLSPLIT: 1 / 2
    	});
    }	
    this.setupGraph();
    }   
      
    
    componentDidMount = () => {
    	console.log("class fail");
    }
       
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
    	height: Math.floor(this.state.pageBottom / 2),
    	width: Math.floor(this.state.pageRight * this.state.CONTROLDIV * this.state.CONTROLSPLIT),
    	float: 'left'
    }
    
    const graphStyle = {
    	height: this.state.pageBottom * this.state.GRAPHVERTDIV,
    	width: modelWidth
    };
    
    const sliderDivStyle = {
    	height: this.state.pageBottom * this.state.SLIDERVERTDIV,
    	width: modelWidth
    };
    
    const sliderStyle = {
    	height: this.state.pageBottom * this.state.SLIDERVERTDIV,
    	width: '99%'
    };
    
    const controlDivStyle = {
    	height: controlHeight,
    	width: controlWidth,
    	overflow: 'hidden',
    	float: this.state.CONTROLDIVFLOAT,
    };
    
    const controlBlockStyle = {
    	height: Math.floor(controlHeight / (10 * this.state.CONTROLSPLIT)),
    	width: controlWidth * this.state.CONTROLSPLIT,
    	overflow: 'hidden',
    	float: 'left'
    };
    
    const dataBlockStyle = {
       	height: controlHeight / (20 * this.state.CONTROLSPLIT),
    	width: Math.floor(controlWidth * this.state.CONTROLSPLIT),
    	overflow: 'hidden',
    	float: 'left'
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
    	height: controlHeight / 20,
    	width: Math.floor(controlWidth  * this.state.CONTROLSPLIT / 4),
    	float: 'left'
    };
    
    const thirdControlStyle = {
    	height: this.state.pageBottom / 20,
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
    	float: this.state.MAPDIVFLOAT
    };

    const skinnyImgStyle = {
    	height: this.state.pageBottom * this.state.MAPVERTDIV / 2,
    	width: skinnyWidth,
    	overflow: 'hidden'
    };
    
    var active = '#44CC44';
    var inactive = '#EEEEEE';
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
    
    const keyContainer = {
    	width: Math.floor(this.state.pageRight * this.state.CONTROLDIV * this.state.CONTROLSPLIT),
    	height: Math.floor(this.state.pageBottom * this.state.CONTROLDVERTDIV * 3 / (20 * this.state.CONTROLSPLIT)),
    	float: 'left',
    	overflow: 'hidden'
    };
    
    return ({ modelWidth, modelHeight, modelLeft, modelDiv, modelSplit, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, controlBlockStyle, dataBlockStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer });
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	console.log("class fail");
    }
    
    onChangeLat = (text) => {
    	//implement isnumeric check
    }
    
    onChangeLon = (text) => {
    	//implement isnumeric check
    }

    render(){
    	return(<p>Class Failed to load Properly</p>);
    }
}
