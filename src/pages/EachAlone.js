import { Dimensions, Image } from "react-native";
import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { precipImgs, tempImgs, iceImgs, dbUrl } from './../const/url.js';


/*** Links to AWS S3 media ***/
const urlPre = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images";
const precipActive = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_precipitation_active.png";
const precipInactive = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_precipitation_inactive.png";
const tempActive = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_temperature_active.png";
const tempInactive = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_temperature_inactive.png";
const iceActive = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_seaice_active.png";
const iceInactive = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_seaice_inactive.png";
const precipKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/precipLegend1.png";
const tempKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tempLegend2.png";
const iceKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/seaiceLegend.png";
const playUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png";
const pauseUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/stop.png";

const artifactImgs = [
	precipActive,
	precipInactive,
	tempActive,
	tempInactive,
	iceActive,
	iceInactive,
	precipKey,
	tempKey,
	iceKey,
	playUrl,
	pauseUrl
];

/*** Div splits from left to right. Should add up to 1 ***/
const CONTROLDIV = 2 / 10;
const SKINNYDIV = 1 / 20;
const MAPDIV = 3 / 4;

const MAPVERTDIV = 3 / 4;
const GRAPHVERTDIV = 2 / 10;
const SLIDERVERTDIV = 1 / 20;


/*** Game Handler Block (recieves page state):  
***  if play=1, increment index with delay in loop
***  else interrupt loop			 ***/

const timer = ms => new Promise(res => setTimeout(res, ms));

var gameHandler = async function(msg, data) {
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
    			play: 0
    			
    		});
	}
	else {
    		data.setState({
    			playButton: playUrl
    		});
    	}
};

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

/*** Page class ***/
class EachAlone extends React.Component {
    constructor(props){
    super(props)
        this.state = {
        	state: 0,
    		modelStr: "/precip/precip_ens",
    		precipSrc: precipActive,
    		tempSrc: tempInactive,
    		iceSrc: iceInactive,
    		keySrc: precipKey,
    		index: 0,
    		play: 0,
    		timerLen: 800,
    		playButton: playUrl,
    		co2data : [0],
    		token: "",
    		precipBool: 0,
    		tempBool: 0,
    		iceBool: 0,
    		yearData: [0],
    		coordData: [0],
    		latitude: 0,
    		longitude: 0,
    		pageBottom: Dimensions.get('window').height,
    		pageRight: Dimensions.get('window').width
    	};
    }

    /*** onPress for 'Precipitation' ***/    
    setPrecip = () => {
    this.setupGraph();
    if(this.state.precipBool == 0){
    	precipImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    }
    this.setupGraph();
    this.setState({ 
        state: 0,
    	modelStr: "/precip/precip_ens",
        precipSrc: precipActive,
    	tempSrc: tempInactive,
    	iceSrc: iceInactive,
    	keySrc: precipKey,
    	precipBool: 1
    });
    this.setupGraph();
    this.doYearHits(0, this.state.index + 1920);
    this.doCoordHits(0, this.state.latitude, this.state.longitude);
    }
   
    /*** onPress for 'Temperature' ***/   
    setTemp = () => {
    this.setupGraph();
    this.setupGraph();
    this.setState({
        state: 1,
    	modelStr: "/temp/temp_ens",
    	precipSrc: precipInactive,
    	tempSrc: tempActive,
        iceSrc: iceInactive,
    	keySrc: tempKey,
    	tempBool: 1
    });
    if(this.state.tempBool == 0){
    	tempImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    }
    this.setupGraph();
    this.doYearHits(1, this.state.index + 1920);
    this.doCoordHits(1, this.state.latitude, this.state.longitude);
    }

    /*** onPress for 'Sea Ice' ***/       
    setIce = () => {
    this.setupGraph();
    this.setupGraph();
    this.setState({
        state: 2,
    	modelStr: "/seaIce/ice_ens",
    	precipSrc: precipInactive,
        tempSrc: tempInactive,
    	iceSrc: iceActive,
    	keySrc: iceKey,
    	iceBool: 1
    });
    if(this.state.iceBool == 0){
    	iceImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    }
    this.setupGraph();
    this.doYearHits(2, this.state.index + 1920);
    this.doCoordHits(2, this.state.latitude, this.state.longitude);
    }

    /*** onPress for 'adagio' ***/       
    setAdagio = () => {
    	this.setupGraph();
    	this.setState({
    		timerLen: 1200
    		});
    }
    
    /*** onPress for 'moderato' ***/   
    setModerato = () => {
    	this.setupGraph();
    	this.setState({
    		timerLen: 800
		});
    }
    
    /*** onPress for 'allegro' ***/   
    setAllegro = () => {
    	this.setupGraph();
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
    
    /*** onPress for 'Play/Pause' 
    *** publish the state, recieved by gameHandler     ***/   
    handleClick = () => {
    	var newState = (this.state.play + 1) % 2;
    	this.setupGraph();
    	this.setState({
    		play: newState
    	});
    	
    	if(newState == 0){
    		this.doYearHits(this.state.state, this.state.index + 1920);
    	}else if(newState == 1){
    		this.setupGraph();
    		this.doCoordHits(this.state.state, this.state.latitude, this.state.longitude);
    	}
    	
    	if(this.state.precipBool == 0){
    		precipImgs.forEach((picture) => {
    			Image.prefetch(picture);
    		});
    		this.setState({precipBool: 1})
    	}
    	PubSub.publish('TOPIC', this);
    }
    
    
    testMusic = (e) => {
    	if(e.buttons == 1){
    		var boxWidth = this.state.pageRight / 5;
    		var boxHeight = this.state.pageBottom * 3 / 20;
    		var boxTop = this.state.pageBottom * 3 / 5;
    		var pressX = e.clientX;
    		var pressY = e.clientY - boxTop;
    		if(this.state.state == 0){
    			console.log("precip x: ", pressX * 450 / boxWidth);
    		}
    		else if(this.state.state == 1){
    			console.log("temp x: ", pressX * 22 / boxWidth - 3);
    		}
    		else if(this.state.state == 2){
    			console.log("ice x: ", pressX * 100 / boxWidth, "%");
    		}
    	}
    }
    
    /*** Used to calculate coords for onMouseDown and onMouseMove ***/
    onMouseDown = (e) => {
        var modelSplit = Math.floor(this.state.pageBottom * MAPVERTDIV / 2);
    	var modelWidth = Math.floor(this.state.pageRight * MAPDIV);
    	var modelHeight = Math.floor(this.state.pageBottom * MAPVERTDIV);
    	var modelLeft = Math.floor(this.state.pageRight * (1 - MAPDIV));
    	var modelDiv = Math.floor(this.state.pageRight * MAPDIV / 3);
    	var x = e.clientX - modelLeft;
    	var y = e.clientY;
    	var latSave = 0;
    	var lonSave = 0;
    	var centerX = 0;
    	var centerY = 0;
    	if(this.state.play == 0 && e.buttons == 1) {
		if (x <= modelDiv && y <= modelSplit) {
	    		centerX = modelDiv / 2;
	    		centerY = modelSplit / 2;
		}
    		else if (x <= modelDiv * 2 && y <= modelSplit){
			centerX = modelDiv + modelDiv / 2;
    			centerY = modelSplit / 2;	
    		}
    		else if (x <= modelDiv * 3 && y <= modelSplit){
			centerX = 2 * modelDiv + modelDiv / 2;
    			centerY = modelSplit / 2;
    		}
    		else if (x <= modelDiv && y <= modelSplit * 2){
			centerX = modelDiv / 2;
    			centerY = modelSplit + modelSplit / 2;   	
    		}
    		else if (x <= modelDiv * 2 && y <= modelSplit * 2){
			centerX = modelDiv + modelDiv / 2;
    			centerY = modelSplit + modelSplit / 2;   	
    		}
    		else if (x <= modelDiv * 3 && y <= modelSplit * 2){
			centerX = 2 * modelDiv + modelDiv / 2;
    			centerY = modelSplit + modelSplit / 2;    	
    		}
    		
    		if (this.state.state == 0 || this.state.state == 1) {
		    	lonSave = (x - centerX) * 360 / modelDiv;
		    	latSave = (centerY - y) * 180 / modelSplit;
		}
		else if (this.state.state == 2) {
			var dx = x - centerX;
			var dy = centerY - y;
			var r = Math.sqrt(dx ** 2 + dy ** 2);
			var theta = Math.atan(dy / dx);
			var projy = r / 2;
			var projx = centerX;
			if (dx <= 0) {
				projx -= r * Math.cos((theta + Math.PI / 2) / 2);
			}
			else {
				projx += r * Math.cos((theta - Math.PI / 2) / 2);
			}
			lonSave = (projx - centerX) * 540 / modelDiv;
		    	latSave = 90 - projy * 90 / modelSplit;
		    	
			/*
			console.log("cx: ", centerX, "   x: ", x, "    dx: ", dx);
			console.log("cy: ", centerY, "   y: ", y, "    dy: ", dy); */
			console.log("r: ", r, "   theta: ", theta);
			console.log("px: ", projx, "py: ", projy);
		}
		this.setupGraph();
	    	this.setState({
	    		latitude: Math.floor(latSave), 
	    		longitude: Math.floor(lonSave)
	    	});
	        }
        }   
        
    
    updateDimensions = () => {
    	this.setState({
    		pageBottom: Dimensions.get('window').height,
    		pageRight: Dimensions.get('window').width
    	});
    	this.setupGraph();
    }    
      
    
    /*** runs on initial render
    *** get CO2 values from DB
    *** preload images
    *** setup gameHandler as subscriber ***/
    componentDidMount = () => {
    	var request = dbUrl.concat("/co2/all");
    	Axios.get(request)
    	.then(res => {
    		const all_co2_data = res.data.data;
    		this.setState({ co2data: [...all_co2_data]});
    	});
	this.setState({
		token: PubSub.subscribe('TOPIC', gameHandler),
    		pageBottom: Dimensions.get('window').height,
    		pageRight: Dimensions.get('window').width
	
	});
	
	artifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
	window.addEventListener('resize', this.updateDimensions);
	window.addEventListener('orientationchange', this.updateDimensions);
	this.setupGraph();
	this.doCoordHits(0, 0, 0);
	this.doYearHits(0, this.state.index + 1920);

    }   
       
    setupGraph() {
        var graphBottom = Math.floor(this.state.pageBottom * GRAPHVERTDIV);
    	var modelWidth = Math.floor(this.state.pageRight * MAPDIV);
    	const ctx = this.refs.models.getContext('2d');
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
    
    updateGraph() {
	if (this.state.index > 0){
    	        var graphBottom = Math.floor(this.state.pageBottom * GRAPHVERTDIV);
    		var modelWidth = Math.floor(this.state.pageRight * MAPDIV);
	    	const ctx = this.refs.models.getContext('2d');
	    	
    		var bottom = graphBottom - 1;
    		var right = modelWidth - 1;
    		
    		var step = right / 180;
    		var avg = bottom / 2;
    		
    		if(this.state.state == 0){
    			var precip_median = 100;
    			var precip_max = 120;
    		
    			ctx.beginPath();
    			for(var precipInd = 1; precipInd < this.state.index; precipInd++){
    			    	var precipAvgKeys = Object.keys(this.state.coordData[0]);
    				var usePrecipAvgKey = precipAvgKeys[precipInd];
    				var prev_val = this.state.coordData[0][usePrecipAvgKey];
    				
    				var precipAvgKeys1 = Object.keys(this.state.coordData[0]);
    				var usePrecipAvgKey1 = precipAvgKeys1[precipInd + 1];
    				var coord_val = this.state.coordData[0][usePrecipAvgKey1];
    			
    				ctx.moveTo(1 + step * (precipInd - 1), avg + avg * ((precip_median - prev_val) / precip_max));
    				ctx.lineTo(1 + step * precipInd, avg + avg * ((precip_median - coord_val) / precip_max));
    				ctx.strokeStyle = "green";
    			}
    			ctx.stroke();
    		}
    		
    		if(this.state.state == 1){
    		var temp_median = 0;
    		var temp_max = 20;
    		var temp_avg = Math.floor(avg * 1.5);
    		
    		ctx.beginPath();
    		for(var tempInd = 1; tempInd < this.state.index; tempInd++){
    		    	var tempAvgKeys = Object.keys(this.state.coordData[0]);
    			var useTempAvgKey = tempAvgKeys[tempInd];
    			var prev_val = this.state.coordData[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.coordData[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd + 1];
    			var coord_val = this.state.coordData[0][useTempAvgKey1];
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_max));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_max));
    			ctx.strokeStyle = "red";
    		}
    		ctx.stroke();
    		}
    		
    		
    		if(this.state.state == 2) {
    		var ice_median = 0;
    		var ice_max = 1;
    		var ice_avg = Math.floor(avg * 0.5);
    		
    		ctx.beginPath();
    		for(var iceInd = 1; iceInd < this.state.index; iceInd++){
    		    	var iceAvgKeys = Object.keys(this.state.coordData[0]);
    			var useIceAvgKey = iceAvgKeys[iceInd];
    			var prev_val = this.state.coordData[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.coordData[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd + 1];
    			var coord_val = this.state.coordData[0][useIceAvgKey1];
    			
    			ctx.moveTo(1 + step * (iceInd - 1), ice_avg + 3 * ice_avg * ((ice_max - prev_val)));
    			ctx.lineTo(1 + step * iceInd, ice_avg + 3 * ice_avg * ((ice_max - coord_val)));
    			ctx.strokeStyle = "blue";
    		}
    		ctx.stroke(); 
    		}
    	}
    }
    
    doCoordHits(state, lat, lon){
    	var dbX = 1;
    	var dbY = 1;
    	dbY = Math.floor((91 - lat) * (240 / 180));
	dbX = Math.floor((181 + lon) * 320 / 360);
	this.setState({
		latitude: Math.floor(lat),
		longitude: Math.floor(lon)
	});
	/* Filter and do db hit here */
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		var table = dbUrl.concat("/table/")
		var intermediate = "";
		if(state == 0){
			intermediate = table.concat("precipavg/coord/(");
		}
		else if(state == 1){
			intermediate = table.concat("tempavg/coord/(");
		}
		else if(state == 2){
			intermediate = table.concat("seaiceavg/coord/(");
		}
		var request = intermediate.concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		console.log(request);
		Axios.get(request)
			.then(res => {
    			const coord_data = res.data.data;
    			this.setState({ coordData: [...coord_data]});
    			this.setupGraph();
    			console.log(coord_data);
    		});
	}
	/* Filter and do db hit here */
    	console.log("dbX: ", dbX, "dbY: ", dbY);
    };
    
    doYearHits(state, year){
	/* Filter and do db hit here */
	if(year >= 1920 && year <= 2100){
		var table = dbUrl.concat("/table/")
		var intermediate = "";
		if(state == 0){
			intermediate = table.concat("precipavg/year/");
		}
		else if(state == 1){
			intermediate = table.concat("tempavg/year/");
		}
		else if(state == 2){
			intermediate = table.concat("seaiceavg/year/");
		}
		var request = intermediate.concat(year.toString(10));
		console.log(request);
		Axios.get(request)
			.then(res => {
    			const year_data = res.data.data;
    			this.setState({ yearData: [...year_data]});
    			console.log(year_data);
    		});
	}
    };
    
    handleYear = (event) => {
    	this.setupGraph();
    	this.setState({
    		index: parseInt(event.target.value)
    	});
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
    	window.removeEventListener('resize', this.updateDimensions);
    	window.removeEventListener('orientationchange', this.updateDimensions);
    }
    
    onChangeLat = (text) => {
    	if(isNumeric(text) == true){
    		this.doCoordHits(this.state.state, parseInt(text), this.state.longitude);
    	}else{
    		this.doCoordHits(this.state.state, 0, this.state.longitude);
    	}
    }
    
    onChangeLon = (text) => {
    	if(isNumeric(text) == true){
    		this.doCoordHits(this.state.state, this.state.latitude, parseInt(text));
    	}else{
    		this.doCoordHits(this.state.state, this.state.latitude, 0);
    	}
    }

    /*** runs on state update ***/   
    render(){
    
    var dbX = 1;
    var dbY = 1;
    dbY = Math.floor((91 - this.state.latitude) * (240 / 180));
    dbX = Math.floor((181 + this.state.longitude) * 320 / 360);
    
    /*** store page stack info ***/
    const { navigation } = this.props;  
    
    var co2val = Math.floor(this.state.co2data[this.state.index].co2_val);
    
    /*** setup model URL ***/
    var urlAdd = urlPre.concat(this.state.modelStr);
    var ind = this.state.index.toString();
    var suffix = ind.concat(".jpg");
    var fullUrl = urlAdd.concat(suffix);
    
    /*** Avg db value ***/
    var coord_val = 0;
    if(this.state.play == 1){
    	var avgKeys = Object.keys(this.state.coordData[0]);
    	var useAvgKey = avgKeys[this.state.index+2];
    	coord_val = this.state.coordData[0][useAvgKey];
    }else if(this.state.play == 0){
        var coord_index = (dbY - 1) * 320 + (dbX - 1);
    	if(this.state.yearData.length > coord_index){
    		var avgKeys = Object.keys(this.state.yearData[coord_index]);
    		var useAvgKey = avgKeys[0];
    		coord_val = this.state.yearData[coord_index][useAvgKey];
    	}
    	else{
    		console.log("dbx: ", dbX, " dbY: ", dbY);
    	}
    }
    
    var modelWidth = Math.floor(this.state.pageRight * MAPDIV);
    var modelHeight = Math.floor(this.state.pageBottom * MAPVERTDIV);
    var modelLeft = Math.floor(this.state.pageRight * (1 - MAPDIV));
    var modelDiv = Math.floor(this.state.pageRight * MAPDIV / 3);
    var modelSplit = Math.floor(this.state.pageBottom * MAPVERTDIV / 2);
    
    var controlWidth = this.state.pageRight * CONTROLDIV;
    
    var skinnyWidth = Math.floor(this.state.pageRight * SKINNYDIV);
    
    /*** style for model images and div ***/
    var modelStyle = {
	width: modelWidth,
	height: modelHeight
    };
    
    const containerStyle = {
    	height: this.state.pageBottom,
    	width: this.state.pageRight,
    	overflow: 'hidden'
    };
    
    var graphStyle = {
    	height: this.state.pageBottom * GRAPHVERTDIV,
    	width: modelWidth
    };
    
    var sliderDivStyle = {
    	height: this.state.pageBottom * SLIDERVERTDIV,
    	width: modelWidth
    };
    
    var sliderStyle = {
    	height: this.state.pageBottom * SLIDERVERTDIV,
    	width: '99%'
    };
    
    var controlDivStyle = {
    	height: this.state.pageBottom,
    	width: controlWidth,
    	overflow: 'hidden',
    	float: 'left'
    };
    
    var largeControlDivStyle = {
    	height: this.state.pageBottom / 10,
    	width: controlWidth,
    	overflow: 'hidden',
    	float: 'left'
    }
    
    var controlBlockStyle = {
    	height: this.state.pageBottom / 10,
    	width: controlWidth,
    	overflow: 'hidden',
    	float: 'left'
    };
    
    var dataBlockStyle = {
       	height: this.state.pageBottom / 20,
    	width: controlWidth,
    	overflow: 'hidden'
    }
    
    var instructionTextStyle = {
    	"font-size": "10px"
    };
    
    var paragraphTextStyle = {
    	"font-size": "8px"
    };
    
    var smallLabelTextStyle = {
    	"font-size": "10px"
    };
    
    var quarterControlStyle = {
    	height: this.state.pageBottom / 20,
    	width: this.state.pageRight * CONTROLDIV / 4,
    	float: 'left'
    };
    
    var thirdControlStyle = {
    	height: this.state.pageBottom / 20,
    	width: this.state.pageRight * CONTROLDIV / 3,
    	float: 'left'
    };
    
    var skinnyDivStyle = {
    	height: this.state.pageBottom * MAPVERTDIV,
    	width: skinnyWidth,
    	overflow: 'hidden',
    	float:'left'
    };
    
    var largeDivStyle = {
    	height: this.state.pageBottom,
    	width: this.state.pageRight * MAPDIV,
    	overflow: 'hidden',
    	float: 'right'
    };

    var skinnyImgStyle = {
    	height: this.state.pageBottom * MAPVERTDIV / 2,
    	width: skinnyWidth,
    	overflow: 'hidden'
    };
    
    var keyContainer = {
    	width: this.state.pageRight * CONTROLDIV,
    	height: this.state.pageBottom * 3 / 20
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
    
    this.updateGraph();
    
    /*** Return the page ***/
    return (
    	<div style={containerStyle}>
    		<div style={controlDivStyle}>
    			<div style={controlBlockStyle} onPointerDown={() => navigation.navigate('Home')}>
				<img style={controlBlockStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"} />
			</div>
			
			<div style={dataBlockStyle}>
				<p style={instructionTextStyle}>Instructions</p>
				<p style={paragraphTextStyle}>1.Select a variable below</p>
			</div>
			
			<div style={dataBlockStyle}>
				
				<div style={thirdControlStyle} onMouseDown={() => this.setPrecip()}>
					<img style={thirdControlStyle} src={this.state.precipSrc}/>
				</div>
				
				<div style={thirdControlStyle} onMouseDown={() => this.setTemp()}>
					<img style={thirdControlStyle} src={this.state.tempSrc}/>
				</div>
				
				<div style={thirdControlStyle} onMouseDown={() => this.setIce()}>
					<img style={thirdControlStyle} src={this.state.iceSrc}/>
				</div>
				
			</div>
			
			<div style={controlBlockStyle}>
				<p style={paragraphTextStyle}>2. Touch the map to select a location</p>
				<p style={paragraphTextStyle}>3. Touch the timeline to select a starting year.</p>
				<p style={paragraphTextStyle}>4. Press the play button.</p>
			</div>
			<div style={controlBlockStyle} onPointerDown={() => this.handleClick()}>
				<img style={controlBlockStyle} src={this.state.playButton}/>
			</div>
			
			<div style={controlBlockStyle}>
				<p style={paragraphTextStyle}>5. Select a tempo</p>
				
				<div style={quarterControlStyle} onPointerDown={this.setAdagio}>
					<span style={adagioHighlight}>adagio</span>
				</div>
				<div style={quarterControlStyle} onPointerDown={this.setModerato}>
					<span style={moderatoHighlight}>moderato</span>
				</div>
				<div style={quarterControlStyle} onPointerDown={this.setAllegro}>
					<span style={allegroHighlight}>allegro</span>
				</div>
				<div style={quarterControlStyle} onPointerDown={this.setPresto}>
					<span style={prestoHighlight}>presto</span>
				</div>
			</div>
			
			<div style={dataBlockStyle}>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>Lat: </p>
				</div>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>{this.state.latitude}</p> {/*Need to implement onchangelat*/}
				</div>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>Lon: </p>
				</div>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>{this.state.longitude}</p>  {/*Need to implement onchangelon*/}
				</div>
			</div>
			
			<div style={dataBlockStyle}>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>Year: </p>
				</div>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>{this.state.index + 1920}</p> {/*Need to implement a way to input text*/}
				</div>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>Co2: </p>
				</div>
				<div style={quarterControlStyle}>
					<p style={smallLabelTextStyle}>{co2val}</p>
				</div>
			</div>
			
			<div style={dataBlockStyle}>
				<p style={smallLabelTextStyle}>Avg Val: {coord_val}</p>
			</div>
			
			<div style={controlBlockStyle} onPointerDown={this.testMusic} onPointerMove={this.testMusic}>
				<img draggable="false" style={dataBlockStyle} src={this.state.keySrc}/>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/linegraphkey1.png"}/>
			</div>
		</div>
		
		<div style={skinnyDivStyle}>
			<img draggable="false" style={skinnyImgStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/sidelabeltopMixed.png"}/>
			<img draggable="false" style={skinnyImgStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/sidelabelbottomMixed.png"}/>
		</div>
		
		<div style={largeDivStyle}>
			
			<div style={modelStyle} onPointerDown={this.onMouseDown} onPointerMove={this.onMouseDown}>
				<img draggable="false" src={fullUrl} style={modelStyle}/>
			</div>
			
			
			<div style={graphStyle}>
				<canvas ref="models" height={this.state.pageBottom * GRAPHVERTDIV} width={modelWidth} />
			</div>
			
			<div style={sliderDivStyle}>
				<input style={sliderStyle} type="range" min="0" max="180" value={this.state.index} step="1" onChange={this.handleYear} />
			</div>
			
		</div>  
    	</div>   
     );
     }
}


/*** class wrapper for naviagion functionality ***/
export default function(props){
    const navigation = useNavigation();

    return <EachAlone {...props} navigation={navigation} />;
}
