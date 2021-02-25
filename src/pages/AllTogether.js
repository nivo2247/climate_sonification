import { Dimensions, Image } from "react-native";
import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { combinedImgs, dbUrl } from './../const/url.js';


/*** Links to AWS S3 media ***/
const urlPre = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images";
const precipKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/precipLegend1.png";
const tempKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tempLegend2.png";
const iceKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/seaiceLegend.png";
const playUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png";
const pauseUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/stop.png";

const artifactImgs = [
	precipKey,
	tempKey,
	iceKey,
	playUrl,
	pauseUrl
];

const PADDING = 5;

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
class EachAlone extends React.Component {
    constructor(props){
    super(props)
        this.state = {
    		modelStr: "/combined/combined_ens",
    		index: 0,
    		play: 0,
    		timerLen: 800,
    		playButton: playUrl,
    		co2data : [0],
    		precipAvg: [0],
    		tempAvg: [0],
    		iceAvg: [0],
    		precipAvgAllCoords: [0],
    		tempAvgAllCoords: [0],
    		iceAvgAllCoords: [0],
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
    	this.setupGraph();
    	this.setState({
    		timerLen: 200
		});
    }
    
    /*** onPress for 'Play/Pause' 
    *** publish the state, recieved by gameHandler     ***/   
    handleClick = () => {
    	var newIndex = this.state.index;
 	if(this.state.play == 0 && this.state.index == 180){
 		newIndex = 0;
 	}
    	var newState = (this.state.play + 1) % 2;
    	this.setupGraph();
    	this.setState({
    		play: newState,
    		useArray: 3,
    		index: newIndex
    	});
    	
    	if(newState == 0){
    		this.doYearHits(this.state.index + 1920);
    	}
    	
    	PubSub.publish('TOPIC', this);
    }
    
    /* TODO: activates when clicking map keys, make this play test note */
    testMusic = (e) => {
    	if(e.buttons == 1){
    		console.log("X: ", e.clientX, "Y: ", e.clientY);
    	}
    }
    
    onPointerUp = (e) => {
    	this.doCoordHits(this.state.latitude, this.state.longitude);
    }
    
    /*** Used to calculate coords for onMouseDown and onMouseMove ***/
    onMouseDown = (e) => {
    	var modelSplit = Math.floor(this.state.pageBottom * this.state.MAPVERTDIV / 2);
    	var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
    	var modelHeight = Math.floor(this.state.pageBottom * this.state.MAPVERTDIV);
    	var modelLeft = Math.floor(this.state.pageRight * (1 - this.state.MAPDIV));
    	var modelDiv = Math.floor(this.state.pageRight * this.state.MAPDIV / 3);
    	var modelTop = 0;
    	if (this.state.pageBottom > this.state.pageRight){
    		modelTop = this.state.pageBottom * this.state.CONTROLVERTDIV;
    	}
    	var x = Math.floor(e.clientX - modelLeft);
    	var y = Math.floor(e.clientY - modelTop);
    	var latSave = 0;
    	var lonSave = 0;
    	var centerX = 0;
    	var centerY = 0;
    	var boxType = 0;
    	if(this.state.play == 0 && e.buttons == 1) {
		if (x <= modelDiv && y <= modelSplit) {
	    		centerX = modelDiv / 2;
	    		centerY = modelSplit / 2;
	    		boxType = 1;
		}
    		else if (x <= modelDiv * 2 && y <= modelSplit){
			centerX = modelDiv + modelDiv / 2;
    			centerY = modelSplit / 2;
    			boxType = 1;	
    		}
    		else if (x <= modelDiv * 3 && y <= modelSplit){
			centerX = 2 * modelDiv + modelDiv / 2;
    			centerY = modelSplit / 2;
    			boxType = 2;
    		}
    		else if (x <= modelDiv && y <= modelSplit * 2){
			centerX = modelDiv / 2;
    			centerY = modelSplit + modelSplit / 2; 
    			boxType = 1;  	
    		}
    		else if (x <= modelDiv * 2 && y <= modelSplit * 2){
			centerX = modelDiv + modelDiv / 2;
    			centerY = modelSplit + modelSplit / 2; 
    			boxType = 1;  	
    		}
    		else if (x <= modelDiv * 3 && y <= modelSplit * 2){
			centerX = 2 * modelDiv + modelDiv / 2;
    			centerY = modelSplit + modelSplit / 2; 
    			boxType = 2;   	
    		}
    		
    		if (boxType == 1) {
		    	lonSave = (x - centerX) * 360 / modelDiv;
		    	latSave = (centerY - y) * 180 / modelSplit;
		}
		else if (boxType == 2) {
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
			
			console.log("lats: ", latSave, "   lons: ", lonSave);
			
			//console.log("cx: ", centerX, "   x: ", x, "    dx: ", dx);
			//console.log("cy: ", centerY, "   y: ", y, "    dy: ", dy); 
			console.log("r: ", r, "   theta: ", theta);
			console.log("px: ", projx, "py: ", projy);
		}
	    	this.setState({
	    		latitude: Math.floor(latSave), 
	    		longitude: Math.floor(lonSave),
	    		useArray: 0
	    		});	
	        }
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
    	this.setupGraph();
	this.setState({
		token: PubSub.subscribe('TOPIC', gameHandler),
	    	pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING
	});
	
	artifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    	
    	combinedImgs.forEach((picture) => {
    			Image.prefetch(picture);
    	});
	window.addEventListener('resize', this.updateDimensions);
	window.addEventListener('orientationchange', this.rotateDimensions);
	this.setupGraph();
	this.doCoordHits(0, 0);
	this.doYearHits(this.state.index + 1920);
	this.updateDimensions();
    }   
       
    setupGraph() {
        var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    	var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
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
    	if (this.state.index > 0 && this.state.index <= 180){
    	        var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    		var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
	    	const ctx = this.refs.models.getContext('2d');
	    	
    		var bottom = graphBottom - 1;
    		var right = modelWidth - 1;
    	
    		var step = right / 180;
    		var avg = bottom / 2;
    	
    		var precip_median = 100;
    		var precip_max = 120;
    		
    		ctx.beginPath();
    		for(var precipInd = 0; precipInd < this.state.index; precipInd++){
    		    	var precipAvgKeys = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey = precipAvgKeys[precipInd + 2];
    			var prev_val = this.state.precipAvg[0][usePrecipAvgKey];
    			
    			var precipAvgKeys1 = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey1 = precipAvgKeys1[precipInd + 3];
    			var coord_val = this.state.precipAvg[0][usePrecipAvgKey1];
    			
    			ctx.moveTo(1 + step * (precipInd - 1), avg + avg * ((precip_median - prev_val) / precip_max));
    			ctx.lineTo(1 + step * precipInd, avg + avg * ((precip_median - coord_val) / precip_max));
    			ctx.strokeStyle = "green";
    		}
    		ctx.stroke();
    		
    		var temp_median = 0;
    		var temp_max = 20;
    		var temp_avg = Math.floor(avg * 1.5);
    		
    		ctx.beginPath();
    		for(var tempInd = 0; tempInd < this.state.index; tempInd++){
    		    	var tempAvgKeys = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey = tempAvgKeys[tempInd + 2];
    			var prev_val = this.state.tempAvg[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd + 3];
    			var coord_val = this.state.tempAvg[0][useTempAvgKey1];
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_max));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_max));
    			ctx.strokeStyle = "red";
    		}
    		ctx.stroke();
    		
    		var ice_median = 0;
    		var ice_max = 1;
    		var ice_avg = Math.floor(avg * 0.5);
    		
    		ctx.beginPath();
    		for(var iceInd = 0; iceInd < this.state.index; iceInd++){
    		    	var iceAvgKeys = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey = iceAvgKeys[iceInd + 2];
    			var prev_val = this.state.iceAvg[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd + 3];
    			var coord_val = this.state.iceAvg[0][useIceAvgKey1];
    			
    			ctx.moveTo(1 + step * (iceInd - 1), ice_avg + 3 * ice_avg * ((ice_max - prev_val)));
    			ctx.lineTo(1 + step * iceInd, ice_avg + 3 * ice_avg * ((ice_max - coord_val)));
    			ctx.strokeStyle = "blue";
    		}
    		ctx.stroke(); 
    	}
    }
    
    doYearHits(year){
	/* Filter and do db hit here */
	if(year >= 1920 && year <= 2100){
		var table = dbUrl.concat("/table/")
		var intermediate0 = table.concat("precipavg/year/");
		var request0 = intermediate0.concat(year.toString(10));
		console.log(request0);
		Axios.get(request0)
			.then(res => {
    			const precip_data = res.data.data;
    			if(this.state.play == 0){
    			this.setState({ 
    				precipAvgAllCoords: [...precip_data],
    				useArray: this.state.useArray + 1
    			});
    			}else{
    			this.setState({ 
    				precipAvgAllCoords: [...precip_data]
    			});
    			}
    			console.log(precip_data);
    		});
    		var intermediate1 = table.concat("tempavg/year/");
		var request1 = intermediate1.concat(year.toString(10));
		console.log(request1);
		Axios.get(request1)
			.then(res => {
    			const temp_data = res.data.data;
    			if(this.state.play == 0){
    			this.setState({ 
    				tempAvgAllCoords: [...temp_data],
    				useArray: this.state.useArray + 1
    			});
    			}
  			else{
  			this.setState({ 
    				tempAvgAllCoords: [...temp_data]
    			});
  			}
    			console.log(temp_data);
    		});
    		var intermediate2 = table.concat("seaiceavg/year/");
		var request2 = intermediate2.concat(year.toString(10));
		console.log(request2);
		Axios.get(request2)
			.then(res => {
    			const ice_data = res.data.data;
    			if(this.state.play == 0){
    			this.setState({ 
    				iceAvgAllCoords: [...ice_data],
    				useArray: this.state.useArray + 1
    			});
    			}
    			else{
    			this.setState({ 
    				iceAvgAllCoords: [...ice_data]
    			});
    			}
    			console.log(ice_data);
    		});
	}
    };
    
    doCoordHits(lat, lon){
    	var dbX = 1;
    	var dbY = 1;
    	dbY = Math.floor((91 - lat) * (240 / 180));
	dbX = Math.floor((181 + lon) * 320 / 360);
	this.setupGraph();
	this.setState({
		latitude: Math.floor(lat),
		longitude: Math.floor(lon)
	});
	/* Filter and do db hit here */
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		var request = dbUrl.concat("/table/precipavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    		const precip_coord_data = res.data.data;
    		this.setState({ precipAvg: [...precip_coord_data]});
    		this.setupGraph();
    		this.updateGraph();
    		console.log(precip_coord_data);
    	});
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		var request = dbUrl.concat("/table/tempavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    		const temp_coord_data = res.data.data;
    		this.setState({ tempAvg: [...temp_coord_data]});
    		this.setupGraph();
    		this.updateGraph();
    		console.log(temp_coord_data);
    	});
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		var request = dbUrl.concat("/table/seaiceavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    		const seaice_coord_data = res.data.data;
    		this.setState({ iceAvg: [...seaice_coord_data]});
    		this.setupGraph();
    		this.updateGraph();
    		console.log(seaice_coord_data);
    	});
	}
	
    	console.log("dbX: ", dbX, "dbY: ", dbY);
    };
    
    handleYear = (event) => {
    	this.setupGraph();
    	this.setState({
    		index: parseInt(event.target.value),
    		useArray: 3
    	});
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
    	window.removeEventListener('resize', this.updateDimensions);
    	window.removeEventListener('oreintationchange', this.updateDimensions);
    }
    
    onChangeLat = (text) => {
    	if(isNumeric(text) == true){
    		this.doCoordHits(parseInt(text), this.state.longitude);
    	}else{
    		this.doCoordHits(0, this.state.longitude);
    	}
    }
    
    onChangeLon = (text) => {
    	if(isNumeric(text) == true){
    		this.doCoordHits(this.state.latitude, parseInt(text));
    	}else{
    		this.doCoordHits(this.state.latitude, 0);
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
    
    var co2val = Math.round(this.state.co2data[this.state.index].co2_val);
    
    /*** setup model URL ***/
    var urlAdd = urlPre.concat(this.state.modelStr);
    var ind = this.state.index.toString();
    var suffix = ind.concat(".jpg");
    var fullUrl = urlAdd.concat(suffix);
    
    var precip_val = 0;
    var temp_val = 0;
    var ice_val = 0;
    
    /*** Set avg db values ***/
    if(this.state.useArray == 3){
    	var precipAvgKeys = Object.keys(this.state.precipAvg[0]);
    	var usePrecipAvgKey = precipAvgKeys[this.state.index+2];
    	precip_val = this.state.precipAvg[0][usePrecipAvgKey];
    
    	var tempAvgKeys = Object.keys(this.state.tempAvg[0]);
    	var useTempAvgKey = tempAvgKeys[this.state.index+2];
    	temp_val = this.state.tempAvg[0][useTempAvgKey];
    
    	var iceAvgKeys = Object.keys(this.state.iceAvg[0]);
    	var useIceAvgKey = iceAvgKeys[this.state.index+2];
    	ice_val = this.state.iceAvg[0][useIceAvgKey];
    }
    else{
    	var coord_index = (dbY - 1) * 320 + (dbX - 1);
    	if(this.state.precipAvgAllCoords.length > coord_index){
    		var avgKeys0 = Object.keys(this.state.precipAvgAllCoords[coord_index]);
    		var useAvgKey0 = avgKeys0[0];
    		precip_val = this.state.precipAvgAllCoords[coord_index][useAvgKey0];
    	}
    	if(this.state.tempAvgAllCoords.length > coord_index){
    		var avgKeys1 = Object.keys(this.state.tempAvgAllCoords[coord_index]);
    		var useAvgKey1 = avgKeys1[0];
    		temp_val = this.state.tempAvgAllCoords[coord_index][useAvgKey1];
    	}
    	if(this.state.iceAvgAllCoords.length > coord_index){
    		var avgKeys2 = Object.keys(this.state.iceAvgAllCoords[coord_index]);
    		var useAvgKey2 = avgKeys2[0];
    		ice_val = this.state.iceAvgAllCoords[coord_index][useAvgKey2];
    	}
    }
    
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
    
    const largeControlBlockStyle = {
    	height: Math.floor(controlHeight * 3 / (20 * this.state.CONTROLSPLIT)),
    	width: Math.floor(controlWidth * this.state.CONTROLSPLIT),
    	overflow: 'hidden',
    	float: 'left'
    }
    
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
    
    this.updateGraph();
    
    /*** Return the page ***/
    
    return (
    <div style={containerStyle}>
    		<div style={controlDivStyle}>
    		<div style={controlContainerStyle}>
			<div style={controlBlockStyle} onPointerDown={() => navigation.navigate('Home')}>
				<img style={controlBlockStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"} />
			</div>
			
			<div style={largeControlBlockStyle}>
				<p style={instructionTextStyle}>Instructions</p>
				<p style={paragraphTextStyle}>1. Touch the map to select a location</p>
				<p style={paragraphTextStyle}>2. Touch the timeline to select a starting year</p>
				<p style={paragraphTextStyle}>3. Press the play button.</p>
				<p style={paragraphTextStyle}>4. Select a tempo</p>
			</div>
			
			<div style={controlBlockStyle} onPointerDown={() => this.handleClick()}>
				<img style={controlBlockStyle} src={this.state.playButton}/>
			</div>
			
			<div style={dataBlockStyle}>
			
				{/*<p style={paragraphTextStyle}>5. Select a tempo</p> */}
				
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
			
			{/*  Code which checked text input
			<View style={{flex:0.05, flexDirection:'row'}}>
				<View style={{flex:0.25}}>
					<Text style={{fontSize: 12}}>Lat:</Text>
				</View>
				<View style={{flex:0.25}}>
					<TextInput value={this.state.latitude} style={{flex:1, borderColor:'gray', borderWidth: 1}} onChangeText={(text) => this.onChangeLat(text)} />
				</View>
				<View style={{flex:0.25}}>
					<Text style={{fontSize: 12}}>Lon:</Text>
				</View>
				<View style={{flex:0.25}}>
					<TextInput value={this.state.longitude} style={{flex:1, borderColor:'gray', borderWidth: 1}} onChangeText={(text) => this.onChangeLon(text)} />
				</View>
			</View>
			*/}
			
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
			
		</div>
			
		<div style={controlContainerStyle}>
		
			<div style={controlBlockStyle}>
				<div style={thirdControlStyle}>
					<p style={smallLabelTextStyle}>Precip:</p>
					<p style={smallLabelTextStyle}>{precip_val}</p>
				</div>
				<div style={thirdControlStyle}>
					<p style={smallLabelTextStyle}>Temp:</p>
					<p style={smallLabelTextStyle}>{temp_val}</p>
				</div>
				<div style={thirdControlStyle}>
					<p style={smallLabelTextStyle}>Sea Ice:</p>
					<p style={smallLabelTextStyle}>{ice_val}</p>
				</div>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/linegraphkey1.png"}/>
			</div>
			
			
			<div style={keyContainer} onPointerDown={this.testMusic} onPointerMove={this.testMusic}>
				<div style={dataBlockStyle}>
					<img draggable="false" style={dataBlockStyle} src={precipKey}/>
				</div>

				<div style={dataBlockStyle}>
					<img draggable="false" style={dataBlockStyle} src={tempKey}/>
				</div>

				<div style={controlBlockStyle}>
					<img draggable="false" style={dataBlockStyle} src={iceKey}/>
				</div>
			</div>
			
		</div>
		</div>
		
		<div style={skinnyDivStyle}>
			<img draggable="false" style={skinnyImgStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/sidelabeltopMixed.png"}/>
			<img draggable="false" style={skinnyImgStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/sidelabelbottomMixed.png"}/>
		</div>
		

		<div style={largeDivStyle}>
			
			<div style={modelStyle} onPointerDown={this.onMouseDown} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>
				<img draggable="false" src={fullUrl} style={modelStyle}/>
			</div>
			
			
			<div style={graphStyle}>
				<canvas ref="models" height={this.state.pageBottom * this.state.GRAPHVERTDIV} width={modelWidth} />
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
