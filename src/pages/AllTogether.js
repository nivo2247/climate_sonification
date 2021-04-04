import { Image } from "react-native";
import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { isBrowser } from 'react-device-detect';
import { Simulation } from './Simulation.js';
import { PADDING } from './Page.js';
import * as Tone from 'tone';
import { getClosestCity, getInfo } from './../const/cities.js';
import { RED, YELLOW, GREEN, BLUE } from './../const/color.js';

import { combinedImgs, dbUrl, urlPre, precipKey, tempKey, iceKey, homeButton, graphKey, topSkinnyImg, bottomSkinnyImg, timelineImg, togetherArtifactImgs, pauseUrl, playUrl } from './../const/url.js';

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

let cancelYearPrecip;
let cancelCoordPrecip;
let cancelCoordPrecip1;
let cancelYearTemp;
let cancelCoordTemp;
let cancelCoordTemp1;
let cancelYearIce;
let cancelCoordIce;
let cancelCoordIce1;

const CancelToken = Axios.CancelToken;

/*** Page class ***/
class AllTogether extends Simulation {
    constructor(props){
    super(props)
        this.state.modelStr = "/combined/combined_ens";
    	this.state.precipAvg = [0];
    	this.state.tempAvg = [0];
    	this.state.iceAvg = [0];
    	this.state.precip1 = [0];
    	this.state.temp1 = [0];
    	this.state.ice1 = [0];
    	this.state.precipAvgAllCoords = [0];
    	this.state.tempAvgAllCoords = [0];
    	this.state.iceAvgAllCoords = [0];
    }
    
    /* TODO: cleanup similar code */
    testPrecipMusic = (e) => {
    	if(this.state.notePlaying === 0 && e.buttons === 1 && this.state.play === 0){
    		var keyLeft = Math.floor(this.state.pageRight / 4);
    		var keyRight = Math.floor(this.state.pageRight / 2);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = Math.floor(this.state.pageRight / 20);
    			keyRight = Math.floor(this.state.pageRight / 20 + this.state.pageRight * 19 / 20 / 3);
    		}
    		var x = e.pageX - keyLeft;
    		var rangeX = keyRight - keyLeft;
   		var percX = x / rangeX;
		var playVal = (percX - .175) * 500 + 100;
   		this.playNoteByVal(0, playVal, this.state.index, this.state.precipAvg);
   	}
    }
    
    testTempMusic = (e) => {
    	if(this.state.notePlaying === 0 && e.buttons === 1 && this.state.play === 0){
    		var keyLeft = Math.floor(this.state.pageRight / 2);
    		var keyRight = Math.floor(this.state.pageRight * 3 / 4);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = Math.floor(this.state.pageRight / 20 + this.state.pageRight * 19 / 20 / 3);
    			keyRight = Math.floor(this.state.pageRight / 20 + 2 * this.state.pageRight * 19 / 20 / 3);
    		}
    		var x = e.pageX - keyLeft;
    		var rangeX = keyRight - keyLeft;
   		var percX = x / rangeX;
		var playVal = (percX - .14) * 23;
   		this.playNoteByVal(1, playVal, this.state.index, this.state.tempAvg);
   	}
    }
    
    testIceMusic = (e) => {
    	if(this.state.notePlaying === 0 && e.buttons === 1 && this.state.play === 0){
    		var keyLeft = Math.floor(this.state.pageRight * 3 / 4);
    		var keyRight = Math.floor(this.state.pageRight);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = Math.floor(this.state.pageRight / 20 + 2 * this.state.pageRight * 19 / 20 / 3);
    			keyRight = Math.floor(this.state.pageRight);
    		}
    		var x = e.pageX - keyLeft;
    		var rangeX = keyRight - keyLeft;
   		var percX = x / rangeX;
		var playVal = percX;
   		this.playNoteByVal(2, playVal, this.state.index, this.state.iceAvg);
   	}
    }
    
    /*** When map coord is selected, do db query ***/
    onPointerUp = (e) => {
    	this.killMapTransport(e);
    	if(this.state.play === 0){
    		this.doCoordHits(this.state.latitude, this.state.longitude);
    	}
    }
    
    /*** Used to calculate coords for onMouseDown and onMouseMove ***/
    onMouseDown = (e) => {
    	if(e.buttons !== 1){
    		return -1
    	}
    	if(this.state.play === 1){
    		this.stopMusic(0);
    	}
    	if(this.state.notePlaying !== 0){
    		return -1;
    	}
    	var modelSplit = Math.floor(this.state.pageBottom * this.state.MAPVERTDIV / 2);
    	var modelLeft = Math.floor(this.state.pageRight * (1 - this.state.MAPDIV));
    	var modelDiv = Math.floor(this.state.pageRight * this.state.MAPDIV / 3);
    	var modelTop = 0;
    	if (this.state.pageBottom > this.state.pageRight){
    		modelTop = this.state.pageBottom * this.state.CONTROLVERTDIV;
    	}
    	var x = Math.floor(e.pageX - modelLeft);
    	var y = Math.floor(e.pageY - modelTop);
    	var latSave = 0;
    	var lonSave = 0;
    	var centerX = 0;
    	var centerY = 0;
    	var boxType = 0;
    	
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
    	
    	if (boxType === 1) {
	    	lonSave = (x - centerX) * 360 / modelDiv;
	    	latSave = (centerY - y) * 180 / modelSplit;
	}
	else if (boxType === 2) {
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
	}
	latSave = Math.max(latSave, -89);
	latSave = Math.min(latSave, 90);
	lonSave = Math.max(lonSave, -180);
	lonSave = Math.min(lonSave, 180);
	this.setState({
		latitude: Math.floor(latSave), 
	   	longitude: Math.floor(lonSave),
	   	useArray: 0
	});	
   	var dbX = 1;
   	var dbY = 1;
    	dbY = Math.floor((91 - this.state.latitude) * (240 / 180));
    	dbX = Math.floor((181 + this.state.longitude) * 320 / 360);
    	var coord_index = (dbY - 1) * 320 + (dbX - 1);
    	if(this.state.precipAvgAllCoords.length >= coord_index && this.state.tempAvgAllCoords.length >= coord_index && this.state.iceAvgAllCoords.length >= coord_index){
    		var val0 = this.getValByCoord(this.state.precipAvgAllCoords, coord_index);
    		var val1 = this.getValByCoord(this.state.tempAvgAllCoords, coord_index);
    		var val2 = this.getValByCoord(this.state.iceAvgAllCoords, coord_index);
    		this.playTogetherMapNotes(val0, val1, val2, this.state.index, this.state.precipAvg, this.state.tempAvg, this.state.iceAvg);
	}
	   
	        
    }    
        
        /*** Run this when stop is pressed or when index === 180 ***/
    stopMusic = (terminate) => {
	this.setState({ play: 0, playButton: playUrl });
	Tone.Transport.stop();
	Tone.Transport.cancel(0);
	if(terminate === 0){
		this.doYearHits(this.state.index + 1920);
	}
    }
    
    /*** runs on initial render ***/
    componentDidMount = () => {
    	this.updateDimensions();
    	this.setState({ co2data: [...this.props.route.params.co2data]});
	
	togetherArtifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    	
    	combinedImgs.forEach((picture) => {
    			Image.prefetch(picture);
    	});
    	
    	if(isBrowser){
		window.addEventListener('resize', this.updateDimensions);
	}
	window.addEventListener('orientationchange', this.rotateDimensions);
	this.doCoordHits(0, 0);
	this.doYearHits(this.state.index + 1920);
	this.setAllegro();
	
    }   
    
    updateGraph() {
    	if (this.state.index > 0 && this.state.index <= 180){
    		const ctx = this.graphRef.current.getContext('2d');
    		
    		var { step, avg, co2_median, co2_range, co2_avg } = this.getGraphDims();
    	
    		var { precip_median, precip_range } = this.getPrecipGraphVars(this.state.precipAvg);
    		
    		var prev_val = 0;
    		var coord_val = 0;
    		
    		ctx.beginPath();
    		for(var precipInd = 0; precipInd <= this.state.index; precipInd++){
    		    	prev_val = this.getValByIndex(this.state.precipAvg, precipInd - 1);
    			coord_val = this.getValByIndex(this.state.precipAvg, precipInd);
    			
    			ctx.moveTo(1 + step * (precipInd - 1), avg + avg * ((precip_median - prev_val) / precip_range));
    			ctx.lineTo(1 + step * precipInd, avg + avg * ((precip_median - coord_val) / precip_range));
    			ctx.strokeStyle = GREEN;
    			ctx.lineWidth = 2;
    		}
    		ctx.stroke();
    		
    		ctx.beginPath();
    		for(precipInd = 0; precipInd <= this.state.index; precipInd++){
    		    	prev_val = this.getValByIndex(this.state.precip1, precipInd - 1);
    			coord_val = this.getValByIndex(this.state.precip1, precipInd);
    			
    			ctx.moveTo(1 + step * (precipInd - 1), avg + avg * ((precip_median - prev_val) / precip_range));
    			ctx.lineTo(1 + step * precipInd, avg + avg * ((precip_median - coord_val) / precip_range));
    			ctx.strokeStyle = GREEN;
    			ctx.lineWidth = 1;
    		}
    		ctx.stroke();
    		
    		var { temp_median, temp_range, temp_avg } = this.getTempGraphVars(this.state.tempAvg, avg);
    		
    		ctx.beginPath();
    		for(var tempInd = 0; tempInd <= this.state.index; tempInd++){
    		    	prev_val = this.getValByIndex(this.state.tempAvg, tempInd - 1);
    			coord_val = this.getValByIndex(this.state.tempAvg, tempInd);
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_range));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_range));
    			ctx.strokeStyle = RED;
    			ctx.lineWidth = 2;
    		}
    		ctx.stroke();
    		
    		ctx.beginPath();
    		for(tempInd = 0; tempInd <= this.state.index; tempInd++){
    		    	prev_val = this.getValByIndex(this.state.temp1, tempInd - 1);
    			coord_val = this.getValByIndex(this.state.temp1, tempInd);
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_range));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_range));
    			ctx.strokeStyle = RED;
    			ctx.lineWidth = 1;
    		}
    		ctx.stroke();
    		
    		var ice_max = 1;
    		var ice_avg = Math.floor(avg * 0.5);
    		
    		ctx.beginPath();
    		for(var iceInd = 0; iceInd <= this.state.index; iceInd++){
    		    	prev_val = this.getValByIndex(this.state.iceAvg, iceInd - 1);
    			coord_val = this.getValByIndex(this.state.iceAvg, iceInd);
    			
    			ctx.moveTo(1 + step * (iceInd - 1), ice_avg + 3 * ice_avg * ((ice_max - prev_val)));
    			ctx.lineTo(1 + step * iceInd, ice_avg + 3 * ice_avg * ((ice_max - coord_val)));
    			ctx.strokeStyle = BLUE;
    			ctx.lineWidth = 2;
    		}
    		ctx.stroke(); 
    		
    		ctx.beginPath();
    		for(iceInd = 0; iceInd <= this.state.index; iceInd++){
    		    	prev_val = this.getValByIndex(this.state.ice1, iceInd - 1);
    			coord_val = this.getValByIndex(this.state.ice1, iceInd);
    			
    			ctx.moveTo(1 + step * (iceInd - 1), ice_avg + 3 * ice_avg * ((ice_max - prev_val)));
    			ctx.lineTo(1 + step * iceInd, ice_avg + 3 * ice_avg * ((ice_max - coord_val)));
    			ctx.strokeStyle = BLUE;
    			ctx.lineWidth = 1;
    		}
    		ctx.stroke(); 
    		
    		ctx.beginPath();
    		for(var co2Ind = 1; co2Ind <= this.state.index; co2Ind++){
    		    	prev_val = this.state.co2data[co2Ind - 1].co2_val;
    			coord_val = this.state.co2data[co2Ind].co2_val;
    			
    			ctx.moveTo(1 + step * (co2Ind - 1), co2_avg - co2_avg * (prev_val - co2_median) / co2_range);
    			ctx.lineTo(1 + step * co2Ind, co2_avg - co2_avg * (coord_val - co2_median) / co2_range);
    			ctx.strokeStyle = YELLOW;
    			ctx.lineWidth = 3;
    		}
    		ctx.stroke();
    	}
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
			MAPVERTDIV: 6 / 10,
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
			MAPVERTDIV: 6 / 20,
			DATAVERTDIV: 1 / 20,
			GRAPHVERTDIV: 3 / 20,
			SLIDERVERTDIV: 1 / 10,
			CONTROLVERTDIV: 7 / 20,
			CONTROLSPLIT: 1 / 2
    		});
    	}	
    	this.setupGraph();
    } 
    
    precipYearApi = (request) => {
    	if(cancelYearPrecip !== undefined){
    		cancelYearPrecip();
    	}
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelYearPrecip = c;
    			})
    		})
		.then(res => {
    			this.setAvgAllCoords(res, 0);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('precip year request cancelled');
    			}	
    		});
    }
    
    tempYearApi = (request) => {
    	if(cancelYearTemp !== undefined){
    		cancelYearIce();
    	}
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelYearTemp = c;
    			})
    		})
		.then(res => {
    			this.setAvgAllCoords(res, 1);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('temp year request cancelled');
    			}	
    		});
    }
    
    iceYearApi = (request) => {
    	if(cancelYearIce !== undefined){
    		cancelYearIce();
    	}
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelYearIce = c;
    			})
    		})
		.then(res => {
    			this.setAvgAllCoords(res, 2);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('ice year request cancelled');
    			}	
    		});
    }
    
    setAvgAllCoords = (res, arrayNum) => {
   	const data = res.data.data;
   	if(arrayNum === 0){
    		this.setState({ precipAvgAllCoords: [...data] });
    	}else if(arrayNum === 1){
    		this.setState({ tempAvgAllCoords: [...data] });
    	}else if(arrayNum === 2){
    		this.setState({ iceAvgAllCoords: [...data] });
    	}
    	if(this.state.play === 0){
    		this.setState({ useArray: this.state.useArray + 1 });
    	}
    	console.log(arrayNum, data);
    }
    
    /*** query db for all coords at a specific year ***/
    doYearHits(year){
	if(year >= 1920 && year <= 2100){
		var table = dbUrl.concat("/table/")
		var intermediate0 = table.concat("precipavg/year/");
		var request0 = intermediate0.concat(year.toString(10));
		this.precipYearApi(request0);
		
    		var intermediate1 = table.concat("tempavg/year/");
		var request1 = intermediate1.concat(year.toString(10));
		this.tempYearApi(request1);
		
    		var intermediate2 = table.concat("seaiceavg/year/");
		var request2 = intermediate2.concat(year.toString(10));
		this.iceYearApi(request2);
	}
    };
    
    /*** Templates for functions which would change the text of lat and lon from textbox input ***/
    onChangeLat = (event) => {
    	var newval = event.target.value;
    	if(this.state.play === 0 && isNumeric(newval)){
    		var parsedval = parseInt(newval);
    		if(parsedval >= -89 && parsedval <= 89){
    			this.doCoordHits(parsedval, this.state.longitude);
    			this.setState({
    				latitude: parsedval,
    				useArray: 0
    			});	
    			this.setupGraph();
    			this.triggerNotes(parsedval, 0);
    			if(this.state.play === 1){
    				this.stopMusic();
    			}
    		}
    	}
    }
    
    onChangeLon = (event) => {
    	var newval = event.target.value;
    	if(this.state.play === 0 && isNumeric(newval)){
    		var parsedval = parseInt(newval);
    		if(parsedval >= -180 && parsedval <= 180){
    			this.doCoordHits(this.state.latitude, parsedval);
    			this.setState({
    				longitude: parsedval,
    				useArray: 0
    			});	
    			this.setupGraph();
    			this.triggerNotes(0, parsedval);
    			if(this.state.play === 1){
    				this.stopMusic();
    			}
    		}
    	}
    }
     
     triggerNotes = (lat, lon) => {
    	var precip_val, temp_val, ice_val;
    	var dbX = 1;
   	var dbY = 1;
   	dbY = Math.floor((91 - lat) * (240 / 180));
   	dbX = Math.floor((181 + lon) * 320 / 360);
    	var coord_index = (dbY - 1) * 320 + (dbX - 1);
    	if(this.state.precipAvgAllCoords.length > coord_index){
    		precip_val = this.getValByCoord(this.state.precipAvgAllCoords, coord_index);
    	}
    	if(this.state.tempAvgAllCoords.length > coord_index){
    		temp_val = this.getValByCoord(this.state.tempAvgAllCoords, coord_index);
    	}
    	if(this.state.iceAvgAllCoords.length > coord_index){
    		ice_val = this.getValByCoord(this.state.iceAvgAllCoords, coord_index);
    	}
    	this.triggerNoteByVal(0, precip_val, this.state.index, this.state.precipAvg);
    	this.triggerNoteByVal(1, temp_val, this.state.index, this.state.tempAvg);
    	this.triggerNoteByVal(2, ice_val, this.state.index, this.state.iceAvg);
    }


    precipCoordApi = (request) => {
    	if(cancelCoordPrecip !== undefined){
    		cancelCoordPrecip();
    	}
    	
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelCoordPrecip = c;
    			})
    		})
    		.then(res => {
			this.setAvgAllYears(res, 0);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('precip coord request cancelled');
    			}	
    		});
    }
    
    precipCoordApi1 = (request) => {
    	if(cancelCoordPrecip1 !== undefined){
    		cancelCoordPrecip1();
    	}
    	
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelCoordPrecip1 = c;
    			})
    		})
    		.then(res => {
			this.setAvgAllYears(res, 3);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('precip1 coord request cancelled');
    			}	
    		});
    }
    
    tempCoordApi = (request) => {
    	if(cancelCoordTemp !== undefined){
    		cancelCoordTemp();
    	}
	
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelCoordTemp = c;
    			})
    		})
    		.then(res => {
    			this.setAvgAllYears(res, 1);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('temp coord request cancelled');
    			}	
    		});
    }
    
    tempCoordApi1 = (request) => {
    	if(cancelCoordTemp1 !== undefined){
    		cancelCoordTemp1();
    	}
	
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelCoordTemp1 = c;
    			})
    		})
    		.then(res => {
    			this.setAvgAllYears(res, 4);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('temp1 coord request cancelled');
    			}	
    		});
    }
    
    iceCoordApi = (request) => {
    	if(cancelCoordIce !== undefined){
    		cancelCoordIce();
    	}
	
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelCoordIce = c;
    			})
    		})
    		.then(res => {
    			this.setAvgAllYears(res, 2);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('ice coord request cancelled');
    			}	
    		});
    }
    
    iceCoordApi1 = (request) => {
    	if(cancelCoordIce1 !== undefined){
    		cancelCoordIce1();
    	}
	
    	Axios.get(request, {
    			cancelToken: new CancelToken(function executor(c){
    				cancelCoordIce1 = c;
    			})
    		})
    		.then(res => {
    			this.setAvgAllYears(res, 5);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('ice1 coord request cancelled');
    			}	
    		});
    }
    
        
    setAvgAllYears = (res, arrayNum) => {
    	const data = res.data.data;
    	var curwait = this.state.waiting;
    	
    	if(arrayNum === 0){
    		this.setState({ precipAvg: [...data] });
    		this.setPrecipNotes(data);
    	}else if(arrayNum === 1){
    		this.setState({ tempAvg: [...data] });
    		this.setTempNotes(data);
    	}else if(arrayNum === 2){
    		this.setState({ iceAvg: [...data] });
    		this.setIceNotes(data);
    	}else if(arrayNum === 3){
    		this.setState({ precip1: [...data] });
    		this.setPrecipNotes1(data);
    	}else if(arrayNum === 4){
    		this.setState({ temp1: [...data] });
    		this.setTempNotes1(data);
    	}else if(arrayNum === 5){
    		this.setState({ ice1: [...data] });
    		this.setIceNotes1(data);
    	}
    	
    	this.setState({ waiting: curwait - 1 });
    	
    	this.setupGraph();
    	this.updateGraph();
    	console.log(arrayNum, data);
    }
    
    /*** query db for all years of a specific coord ***/
    doCoordHits(lat, lon){
    	var closestcity = getClosestCity(lat, lon)
    	var dbX = 1;
    	var dbY = 1;
    	dbY = Math.floor((91 - lat) * (240 / 180));
	dbX = Math.floor((181 + lon) * 320 / 360);
	this.setState({
		latitude: Math.floor(lat),
		longitude: Math.floor(lon),
		closestCity: closestcity,
		waiting: 6
	});
	var request;
	/* Filter and do db hit here */
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		request = dbUrl.concat("/table/precipavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.precipCoordApi(request);
		request = dbUrl.concat("/table/tempavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.tempCoordApi(request);
		request = dbUrl.concat("/table/seaiceavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.iceCoordApi(request);
		request = dbUrl.concat("/table/precip001/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.precipCoordApi1(request);
		request = dbUrl.concat("/table/temp001/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.tempCoordApi1(request);
		request = dbUrl.concat("/table/seaice001/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.iceCoordApi1(request);
	}
    };
    
    /*** Run this when play button is pressed
	 * A few modifications for the real thing:
	 * 	- use Sequence instead of Pattern
	 * 	- determine start based on index, may need to
	 * 	slice to make this work.  But should first see
	 * 	if this can be accomplished using pause rather
	 * 	than stop.
	 ****/	
	playMusic = () => {
		if(this.state.waiting > 0){
			console.log('waiting');
			return;
		}
		var newind = this.state.index;
		if(newind === 180){
			newind = 0;
		}
		const precipsynth = this.getSynth(0);
		const tempsynth = this.getSynth(1);
		const icesynth = this.getSynth(2);
		const precipsynth1 = this.getSynth(0);
		precipsynth1.volume.value = -12;
		const tempsynth1 = this.getSynth(1);
		tempsynth1.volume.value = -12;
		const icesynth1 = this.getSynth(2);
		icesynth1.volume.value = -12;
		
		const precipNotes = this.getPrecipNotes(newind);
		const precipNotes1 = this.getPrecipNotes1(newind);
		const tempNotes = this.getTempNotes(newind);
		const tempNotes1 = this.getTempNotes1(newind);
		const iceNotes = this.getIceNotes(newind);
		const iceNotes1 = this.getIceNotes1(newind);
		
		this.setState( { play: 1, playButton: pauseUrl, useArray: 3, index: newind });
		const precipPattern = new Tone.Pattern((time, note) => {
			precipsynth.triggerAttackRelease(note, '16n', time);
			// bind incrementing
			Tone.Draw.schedule(() => {
				this.incrementIndex();
			}, time)
		}, precipNotes);
		precipPattern.humanize = true;
		
		const precipPattern1 = new Tone.Pattern((time, note) => {
			precipsynth1.triggerAttackRelease(note, '16n', time);
		}, precipNotes1);
		precipPattern1.humanize = true;
		
		const tempPattern = new Tone.Pattern((time, note) => {
			tempsynth.triggerAttackRelease(note, '16n', time);
		}, tempNotes);
		tempPattern.humanize = true;
		
		const tempPattern1 = new Tone.Pattern((time, note) => {
			tempsynth1.triggerAttackRelease(note, '16n', time);
		}, tempNotes1);
		tempPattern1.humanize = true;
		
		const icePattern = new Tone.Pattern((time, note) => {
			icesynth.triggerAttackRelease(note, '16n', time);
		}, iceNotes);
		icePattern.humanize = true;
		
		const icePattern1 = new Tone.Pattern((time, note) => {
			icesynth1.triggerAttackRelease(note, '16n', time);
		}, iceNotes1);
		icePattern1.humanize = true;

		// catches most errors
		if(this.state.audioAvailable) {
			precipPattern.start(0);
			precipPattern1.start(0);
			tempPattern.start(0);
			tempPattern1.start(0);
			if(this.getValByIndex(this.state.iceAvg, 0) !== 0){
				icePattern.start(0);
				icePattern1.start(0);
			}
			Tone.Transport.start('+0');
		} else {
			Tone.start().then(() => {
				this.setState({ audioAvailable: true })
				precipPattern.start(0.001);
				precipPattern1.start(0.001);
				tempPattern.start(0.001);
				tempPattern1.start(0.001);
				if(this.getValByIndex(this.state.iceAvg, 0) !== 0){
					icePattern.start(0.001);
					icePattern1.start(0.001);
				}
				Tone.Transport.start('+0');
			}).catch(error => console.error(error));
		}
	}
	
	playTogetherMapNotes = (val1, val2, val3, index, data1, data2, data3) => {
		const synth0 = this.getSynth(0);
		const synth1 = this.getSynth(1);
		const synth2 = this.getSynth(2);
		//synth.sync();
		const note0 = this.getNote(0, val1);
		const note1 = this.getNote(1, val2);
		const note2 = this.getNote(2, val3);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth0.triggerAttackRelease(note0, '16n');
			synth1.triggerAttackRelease(note1, '16n');
			synth2.triggerAttackRelease(note2, '16n');
		}, '+0');
		Tone.Transport.scheduleOnce((time) => {
			this.setState({notePlaying:0});
			synth0.dispose();
			synth1.dispose();
			synth2.dispose();
		}, '+4n');
	}
    
    getTogetherStyles(mw, ch, cw) {
    	var modelWidth = mw;
    	var controlHeight = ch;
    	var controlWidth = cw;
    	var newh = controlHeight * 5 / 20;
    	if(this.state.CONTROLVERTDIV !== 1){
    		newh /= (1 - this.state.CONTROLVERTDIV)
    	}
    
    	var largeControlBlockStyle = {
    		height: Math.floor(newh),
    		width: Math.floor(controlWidth * this.state.CONTROLSPLIT),
    		overflow: 'hidden',
    		float: 'left'
    	}
    
    	var graphHeight = this.state.pageBottom * this.state.GRAPHVERTDIV;
    	if(isNaN(graphHeight)){
    		graphHeight = 0;
    	}
    
    	var graphWidth = modelWidth;
    	if(isNaN(graphWidth)){
    		graphWidth = 0;
    	}
    	return { largeControlBlockStyle, graphHeight, graphWidth };
    }
    
    updateYearVals = () => {
    	if(this.state.play === 0){
    		this.doYearHits(this.state.index + 1920);
    	}
    }
    
    changeToCity = (event) => {
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
    	if(this.state.play === 1){
    		this.stopMusic();
    	}
     }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
    	if(isBrowser){
    		window.removeEventListener('resize', this.updateDimensions);
    	}
    	window.removeEventListener('orientationchange', this.rotateDimensions);
    }
    
    setupPrecipTransport = (e) => {
    	Tone.Transport.start('+0');
    	this.testPrecipMusic(e);
    }
    
    setupTempTransport = (e) => {
    	Tone.Transport.start('+0');
    	this.testTempMusic(e);
    }
    
    setupIceTransport = (e) => {
    	Tone.Transport.start('+0');
    	this.testIceMusic(e);
    }
    
    getLocations = () => {
    	var fsize = 12;
    	/* A bunch of variables used to calculate crosshair position */
        var modelSplit = Math.floor(this.state.pageBottom * this.state.MAPVERTDIV / 2);
    	var modelLeft = Math.floor(this.state.pageRight * (1 - this.state.MAPDIV));
    	var modelDiv = Math.floor(this.state.pageRight * this.state.MAPDIV / 3);
    	var modelTop = 0;
    	if (this.state.pageBottom > this.state.pageRight){
    		modelTop = this.state.pageBottom * this.state.CONTROLVERTDIV;
    	}
    	
    	var centerX = 0;
    	var centerY = 0;
    	
    	var xAdj = (this.state.longitude * modelDiv / 360) - (fsize / 4);
    	var yAdj = (this.state.latitude * modelSplit / 180) + (fsize / 2);
	
	centerX = modelLeft + modelDiv / 2;
	centerY = modelTop + modelSplit / 2;
	var location1 = {
    		position: 'absolute',
    		left: centerX + xAdj,
    		top: centerY - yAdj,
    		color: 'red',
    		fontSize: fsize,
    		border: '1px solid red',
    		backgroundColor: 'white',
    		lineHeight: 1
    	}
	
	
    	centerX = modelLeft + modelDiv + modelDiv / 2;
    	centerY = modelTop + modelSplit / 2;	
    	var location2 = {
    		position: 'absolute',
    		left: centerX + xAdj,
    		top: centerY - yAdj,
    		color: 'red',
    		fontSize: fsize,
    		border: '1px solid red',
    		backgroundColor: 'white',
    		lineHeight: 1
    	}
	
	centerX = modelLeft + modelDiv / 2;
    	centerY = modelTop + modelSplit + modelSplit / 2;   	
    	var location4 = {
    		position: 'absolute',
    		left: centerX + xAdj,
    		top: centerY - yAdj,
    		color: 'red',
    		fontSize: fsize,
    		border: '1px solid red',
    		backgroundColor: 'white',
    		lineHeight: 1
    	}
    	
    	centerX = modelLeft + modelDiv + modelDiv / 2;
    	centerY = modelTop + modelSplit + modelSplit / 2;   	
    	var location5 = {
    		position: 'absolute',
    		left: centerX + xAdj,
    		top: centerY - yAdj,
    		color: 'red',
    		fontSize: fsize,
    		border: '1px solid red',
    		backgroundColor: 'white',
    		lineHeight: 1
    	}
	
	xAdj = 0 - fsize / 2;
    	yAdj = 0 + fsize / 2;
    		
    	//var r = 90 - this.state.latitude;
    	//console.log(r);
    	
    	centerX = modelLeft + 2 * modelDiv + modelDiv / 2;
    	centerY = modelTop + modelSplit / 2;
    	var location3 = {
    		position: 'absolute',
    		left: centerX + xAdj,
    		top: centerY - yAdj,
    		color: 'red',
    		fontSize: fsize,
    		border: '1px solid red',
    		backgroundColor: 'white',
    		lineHeight: 1
    	}
	
	centerX = modelLeft + 2 * modelDiv + modelDiv / 2;
    	centerY = modelTop + modelSplit + modelSplit / 2;
    	var location6 = {
    		position: 'absolute',
    		left: centerX + xAdj,
    		top: centerY - yAdj,
    		color: 'red',
    		fontSize: 12,
    		border: '1px solid red',
    		backgroundColor: 'white',
    		lineHeight: 1
    	}
    	
    	if(this.state.latitude < 65){
    		location3.display = 'none';
    		location6.display = 'none';
    	}
    	
    	return { location1, location2, location3, location4, location5, location6 };
    }

    /*** runs on state update ***/   
    render(){
    
    var { location1, location2, location3, location4, location5, location6 } = this.getLocations();
    
    var playButton = this.getPlayButton();
    
    var dbX = 1;
    var dbY = 1;
    dbY = Math.floor((91 - this.state.latitude) * (240 / 180));
    dbX = Math.floor((181 + this.state.longitude) * 320 / 360);  
    
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
    if(this.state.useArray === 3){
    	precip_val = this.getValByIndex(this.state.precipAvg, this.state.index);
    	temp_val = this.getValByIndex(this.state.tempAvg, this.state.index);
    	ice_val = this.getValByIndex(this.state.iceAvg, this.state.index);
    }
    else{
    	var coord_index = (dbY - 1) * 320 + (dbX - 1);
    	if(this.state.precipAvgAllCoords.length > coord_index){
    		precip_val = this.getValByCoord(this.state.precipAvgAllCoords, coord_index);
    	}
    	if(this.state.tempAvgAllCoords.length > coord_index){
    		temp_val = this.getValByCoord(this.state.tempAvgAllCoords, coord_index);
    	}
    	if(this.state.iceAvgAllCoords.length > coord_index){
    		ice_val = this.getValByCoord(this.state.iceAvgAllCoords, coord_index);
    	}
    }
    
    var temp_pre = "Temperature: +";
    if(temp_val < 0){
    	temp_pre = "Temperature: ";
    }
    
    ice_val *= 100;
    ice_val = Math.round(ice_val * 100) / 100;
    temp_val = Math.round(temp_val * 100) / 100;
    precip_val = Math.round(precip_val * 100) / 100;
    
    const { modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, halfControlStyle, inputControlStyle, bigLabelControlStyle, labelControlStyle, dropdownControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer, dataThirdStyle } = this.getCommonStyles();
    
    const { largeControlBlockStyle, graphHeight, graphWidth } = this.getTogetherStyles(modelWidth, controlHeight, controlWidth );
    
    this.updateGraph();
    
    /*** Return the page ***/
    
    return (
    <div style={containerStyle}>
    		<div style={controlDivStyle}>
    		<div style={controlContainerStyle}>
			<div style={controlBlockStyle} onPointerUp={() => this.callHome()}>
				<img style={controlBlockStyle} alt="home button" src={homeButton} />
			</div>
			
			<div style={largeControlBlockStyle}>
				<p style={instructionTextStyle}>Instructions</p>
				<p style={paragraphTextStyle}>1. Touch the map to select a location<br/>2. Touch the timeline to select a starting year<br/>3. Select a tempo<br/>4. Press the play button.</p>
			</div>
			
			<div style={controlBlockStyle}>
				{/* This originally used this.handleClick().  I may still need to use the game
				handler here.  But I might be able to just use the inhereted play method.  I think
				I will need to use some methods in this file too.  I'm just not sure which ones yet */}
				<div style={playSplitDivStyle} onPointerDown={this.state.play ? () => this.stopMusic(0) : () => this.playMusic()}>
					<img style={playSplitDivStyle} alt="play button" src={playButton}/>
				</div>
				
				<div style={quarterControlStyle}>
					<span style={paragraphTextStyle}>Tempo:</span>
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
			
		</div>
			
		<div style={controlContainerStyle}>
		
			<form>
				<div style={dataBlockStyle}>
					<label htmlFor='lat' style={labelControlStyle}> Lat:</label>
					<input type='text' style={inputControlStyle} id='lat' value={this.state.latitude} onChange={this.onChangeLat}/>
					<label htmlFor='lon' style={labelControlStyle}> Lon:</label>
					<input type='text' style={inputControlStyle} id='lon' value={this.state.longitude} onChange={this.onChangeLon} />
				</div>
			
				<div style={dataBlockStyle}>
					<label htmlFor='city' style={bigLabelControlStyle}> Nearest City:</label>
					<select name='city' id='city' style={dropdownControlStyle} value={this.state.closestCity} onChange={this.changeToCity}>
						<optgroup label='Africa'>
							<option value='Antananarivo'>Antananarivo</option>
							<option value='Cairo'>Cairo</option>
							<option value='Cape Town'>Cape Town</option>
							<option value='Dakar'>Dakar</option>
							<option value='Kinshasa'>Kinshasa</option>
							<option value='Lagos'>Lagos</option>
							<option value='Marrakesh'>Marrakesh</option>
							<option value='Nairobi'>Nairobi</option>
							<option value='Pretoria'>Pretoria</option>
							<option value='Tunis'>Tunis</option>
						</optgroup>
						
						<optgroup label='Asia'>
							<option value='Bangkok'>Bangkok</option>
							<option value='Beijing'>Beijing</option>
							<option value='Bengaluru'>Bengaluru</option>
							<option value='Hanoi'>Hanoi</option>
							<option value='Hong Kong'>Hong Kong</option>
							<option value='New Delhi'>New Delhi</option>
							<option value='Nur-Sultan'>Nur-Sultan</option>
							<option value='Seoul'>Seoul</option>
							<option value='Singapore'>Singapore</option>
							<option value='Tokyo'>Tokyo</option>
						</optgroup>
						
						<optgroup label='Europe'>
							<option value='Amsterdam'>Amsterdam</option>
							<option value='Berlin'>Berlin</option>
							<option value='Budapest'>Budapest</option>
							<option value='Istanbul'>Istanbul</option>
							<option value='Kyiv'>Kyiv</option>
							<option value='London'>London</option>
							<option value='Madrid'>Madrid</option>
							<option value='Moscow'>Moscow</option>
							<option value='Paris'>Paris</option>
							<option value='Reykjavik'>Reykjavik</option>
							<option value='Riyadh'>Riyadh</option>
							<option value='Rome'>Rome</option>
							<option value='Stockholm'>Stockholm</option>
							<option value='Tehran'>Tehran</option>
							<option value='Vienna'>Vienna</option>
							<option value='Warsaw'>Warsaw</option>
						</optgroup>
						
						<optgroup label='North America'>
							<option value='Anchorage'>Anchorage</option>
							<option value='Austin'>Austin</option>
							<option value='Calgary'>Calgary</option>
							<option value='Denver'>Denver</option>
							<option value='Havana'>Havana</option>
							<option value='Los Angeles'>Los Angeles</option>
							<option value='Mexico City'>Mexico City</option>
							<option value='New York'>New York</option>
							<option value='Orlando'>Orlando</option>
							<option value='Panama City'>Panama City</option>
							<option value='San Francisco'>San Francisco</option>
							<option value='Vancouver'>Vancouver</option>
							<option value='Winnipeg'>Winnipeg</option>
						</optgroup>
						
						<optgroup label='Oceanea'>
							<option value='Auckland'>Auckland</option>
							<option value='Jakarta'>Jakarta</option>
							<option value='Perth'>Perth</option>
							<option value='Port Moresby'>Port Morseby</option>
							<option value='Sydney'>Syney</option>
						</optgroup>
						
						<optgroup label='South America'>
							<option value='Asuncion'>Asuncion</option>
							<option value='Bogota'>Bogota</option>
							<option value='Buenos Aires'>Buenos Aires</option>
							<option value='Caracas'>Caracas</option>
							<option value='Lima'>Lima</option>
							<option value='La Paz'>La Paz</option>
							<option value='Sao Paulo'>Sao Paulo</option>
							<option value='Santiago'>Santiago</option>
							<option value='Punta Arenas'>Punta Arenas</option>
							<option value='Quito'>Quito</option>
						</optgroup>
					</select>
				</div>
			</form>
		
			<div style={dataBlockStyle}>
				<div style={halfControlStyle}>
					<p style={smallLabelTextStyle}>Year: {this.state.index + 1920}</p>
				</div>
				<div style={halfControlStyle}>
					<p style={smallLabelTextStyle}>CO2: {co2val} ppm</p>
				</div>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} alt="graph key" src={graphKey}/>
			</div>
			
		</div>
		</div>
		
		<div style={skinnyDivStyle}>
			<img style={skinnyImgStyle} alt="human influence on climate" src={topSkinnyImg} draggable="false"/>
			<img style={skinnyImgStyle} alt="human and natural influence on climate" src={bottomSkinnyImg} draggable="false"/>
		</div>
		

		<div style={largeDivStyle}>
			
			<div style={modelStyle} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>
				<img src={fullUrl} alt="climate model" style={modelStyle} draggable="false"/>
			</div>
			
			<div style={graphBufferStyle}>
				<div style={dataThirdStyle}>
					<p style={smallLabelTextStyle}>Precipitation: {precip_val} % of Annual Avg</p>
				</div>
				<div style={dataThirdStyle}>
					<p style={smallLabelTextStyle}>{temp_pre}{temp_val} Celsius (vs 1920-1950)</p>
				</div>
				<div style={dataThirdStyle}>
					<p style={smallLabelTextStyle}>Sea Ice Fraction: {ice_val} %</p>
				</div>
			</div>
			
			<div style={graphBufferStyle}>
				<div style={dataThirdStyle} onPointerDown={this.setupPrecipTransport} onPointerMove={this.testPrecipMusic} onPointerUp={this.killTransport}>
					<img style={dataThirdStyle} alt="precipitation key" src={precipKey} draggable="false"/>
				</div>

				<div style={dataThirdStyle} onPointerDown={this.setupTempTransport} onPointerMove={this.testTempMusic} onPointerUp={this.killTransport}>
					<img style={dataThirdStyle} alt="temperature key" src={tempKey} draggable="false"/>
				</div>

				<div style={dataThirdStyle} onPointerDown={this.setupIceTransport}  onPointerMove={this.testIceMusic} onPointerUp={this.killTransport}>
					<img style={dataThirdStyle} alt="sea ice key" src={iceKey} draggable="false"/>
				</div>
			</div>
			
			<div style={graphStyle}>
				<canvas ref={this.graphRef} height={graphHeight} width={graphWidth} />
			</div>
			
			<div style={graphBufferStyle}/>
			<div style={graphBufferStyle}/>
			
			<div style={sliderDivStyle} onPointerUp={this.updateYearVals}>
				<input style={sliderStyle} type="range" min="0" max="180" value={this.state.index} step="1" onChange={this.handleYear} />
				<img style={sliderStyle} alt="" src={timelineImg}/>
			</div>
			
		</div>
		<div style={location1} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>o</div>   
		<div style={location2} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>o</div>   
		<div style={location3} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>o</div>   
		<div style={location4} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>o</div>   
		<div style={location5} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>o</div>   
		<div style={location6} onPointerDown={this.setupMapTransport} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>o</div> 
    	</div> 
     );
     }
}


/*** class wrapper for naviagion functionality ***/
export default function AllTogetherWrapper(props){
    const navigation = useNavigation();

    return <AllTogether {...props} navigation={navigation} />;
}
