import { Image } from "react-native";
import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { isBrowser } from 'react-device-detect';
import { Simulation } from './Simulation.js';
import * as Tone from 'tone';
import { getClosestCity, getInfo } from './../const/cities.js';

import { combinedImgs, dbUrl, urlPre, precipKey, tempKey, iceKey, homeButton, graphKey, topSkinnyImg, bottomSkinnyImg, timelineImg, togetherArtifactImgs, pauseUrl, playUrl } from './../const/url.js';

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

let cancelYearPrecip;
let cancelCoordPrecip;
let cancelYearTemp;
let cancelCoordTemp;
let cancelYearIce;
let cancelCoordIce;

const CancelToken = Axios.CancelToken;

/*** Page class ***/
class AllTogether extends Simulation {
    constructor(props){
    super(props)
        this.state.modelStr = "/combined/combined_ens";
    	this.state.precipAvg = [0];
    	this.state.tempAvg = [0];
    	this.state.iceAvg = [0];
    	this.state.precipAvgAllCoords = [0];
    	this.state.tempAvgAllCoords = [0];
    	this.state.iceAvgAllCoords = [0];
    }
    
    /* TODO: cleanup similar code */
    testPrecipMusic = (e) => {
    	if(this.state.notePlaying === 0 && e.buttons === 1 && this.state.play === 0){
    		var keyLeft = 0;
    		var keyRight = Math.floor(this.state.pageRight * this.state.CONTROLDIV);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = this.state.pageRight / 2;
    			keyRight = this.state.pageRight;
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
    		var keyLeft = 0;
    		var keyRight = Math.floor(this.state.pageRight * this.state.CONTROLDIV);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = this.state.pageRight / 2;
    			keyRight = this.state.pageRight;
    		}
    		var x = e.pageX - keyLeft;
    		var rangeX = keyRight - keyLeft;
   		var percX = x / rangeX;
		var playVal = (percX - .175) * 500 + 100;
   		this.playNoteByVal(1, playVal, this.state.index, this.state.tempAvg);
   	}
    }
    
    testIceMusic = (e) => {
    	if(this.state.notePlaying === 0 && e.buttons === 1 && this.state.play === 0){
    		var keyLeft = 0;
    		var keyRight = Math.floor(this.state.pageRight * this.state.CONTROLDIV);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = this.state.pageRight / 2;
    			keyRight = this.state.pageRight;
    		}
    		var x = e.pageX - keyLeft;
    		var rangeX = keyRight - keyLeft;
   		var percX = x / rangeX;
		var playVal;
   		playVal = (percX - .175) * 500 + 100;
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
    	if(this.state.notePlaying !== 0){
    		return;
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
    	if(this.state.play === 0 && e.buttons === 1) {
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
	        
        }    
        
        /*** Run this when stop is pressed or when index === 180 ***/
	stopMusic = () => {
		this.setState({ play: 0, playButton: playUrl });
		Tone.Transport.stop();
		Tone.Transport.cancel(0);
		this.doYearHits(this.state.index + 1920);
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
	
    }   
    
    updateGraph() {
    	if (this.state.index > 0 && this.state.index <= 180){
    	        var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    		var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
	    	const ctx = this.graphRef.current.getContext('2d');
	    	
    		var bottom = graphBottom - 1;
    		var right = modelWidth - 1;
    	
    		var step = right / 180;
    		var avg = bottom / 2;
    	
    		var precip_median = 100;
    		var precip_max = 120;
    		
    		var prev_val = 0;
    		var coord_val = 0;
    		
    		ctx.beginPath();
    		for(var precipInd = 0; precipInd <= this.state.index; precipInd++){
    		    	prev_val = this.getValByIndex(this.state.precipAvg, precipInd - 1);
    			coord_val = this.getValByIndex(this.state.precipAvg, precipInd);
    			
    			ctx.moveTo(1 + step * (precipInd - 1), avg + avg * ((precip_median - prev_val) / precip_max));
    			ctx.lineTo(1 + step * precipInd, avg + avg * ((precip_median - coord_val) / precip_max));
    			ctx.strokeStyle = "green";
    		}
    		ctx.stroke();
    		
    		var temp_median = 0;
    		var temp_max = 20;
    		var temp_avg = Math.floor(avg * 1.5);
    		
    		ctx.beginPath();
    		for(var tempInd = 0; tempInd <= this.state.index; tempInd++){
    		    	prev_val = this.getValByIndex(this.state.tempAvg, tempInd - 1);
    			coord_val = this.getValByIndex(this.state.tempAvg, tempInd);
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_max));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_max));
    			ctx.strokeStyle = "red";
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
    			ctx.strokeStyle = "blue";
    		}
    		ctx.stroke(); 
    		
    		var co2_median = 300;
    		var co2_range = 700;
    		var co2_avg = Math.floor(avg * 1.6);
    		
    		ctx.beginPath();
    		for(var co2Ind = 1; co2Ind <= this.state.index; co2Ind++){
    		    	prev_val = this.state.co2data[co2Ind - 1].co2_val;
    			coord_val = this.state.co2data[co2Ind].co2_val;
    			
    			ctx.moveTo(1 + step * (co2Ind - 1), co2_avg - co2_avg * (prev_val - co2_median) / co2_range);
    			ctx.lineTo(1 + step * co2Ind, co2_avg - co2_avg * (coord_val - co2_median) / co2_range);
    			ctx.strokeStyle = "yellow";
    		}
    		ctx.stroke();
    	}
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
    			const precip_data = res.data.data;
    			if(this.state.play === 0){
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
    			const temp_data = res.data.data;
    			if(this.state.play === 0){
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
    			const ice_data = res.data.data;
    			if(this.state.play === 0){
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
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('ice year request cancelled');
    			}	
    		});
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
    		}
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
    			const precip_coord_data = res.data.data;
    			this.setState({ precipAvg: [...precip_coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(precip_coord_data);
    			this.setPrecipNotes(precip_coord_data);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('precip coord request cancelled');
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
    			const temp_coord_data = res.data.data;
    			this.setState({ tempAvg: [...temp_coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(temp_coord_data);
    			this.setTempNotes(temp_coord_data);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('temp coord request cancelled');
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
    			const seaice_coord_data = res.data.data;
    			this.setState({ iceAvg: [...seaice_coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(seaice_coord_data);
    			this.setIceNotes(seaice_coord_data);
    		})
    		.catch((error) => {
    			if(Axios.isCancel(error)){
    				console.log('ice coord request cancelled');
    			}	
    		});
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
		closestCity: closestcity
	});
	var request;
	/* Filter and do db hit here */
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		request = dbUrl.concat("/table/precipavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.precipCoordApi(request);
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		request = dbUrl.concat("/table/tempavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.tempCoordApi(request);
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		request = dbUrl.concat("/table/seaiceavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		this.iceCoordApi(request);
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
		var newind = this.state.index;
		if(newind === 180){
			newind = 0;
		}
		const precipsynth = this.getSynth(0);
		const tempsynth = this.getSynth(1);
		const icesynth = this.getSynth(2);
		
		this.setState( { play: 1, playButton: pauseUrl, useArray: 3, index: newind });
		const precipPattern = new Tone.Pattern((time, note) => {
			precipsynth.triggerAttackRelease(note, '16n', time);
			// bind incrementing
			Tone.Draw.schedule(() => {
				this.incrementIndex();
			}, time)
		}, this.getPrecipNotes(newind));
		precipPattern.humanize = true;
		
		const tempPattern = new Tone.Pattern((time, note) => {
			tempsynth.triggerAttackRelease(note, '16n', time);
		}, this.getTempNotes(newind));
		tempPattern.humanize = true;
		
		const icePattern = new Tone.Pattern((time, note) => {
			icesynth.triggerAttackRelease(note, '16n', time);
		}, this.getIceNotes(newind));
		icePattern.humanize = true;

		// catches most errors
		if(this.state.audioAvailable) {
			precipPattern.start(0);
			tempPattern.start(0.001);
			if(this.getValByIndex(this.state.iceAvg, 0) !== 0){
				icePattern.start(0.002);
			}
			Tone.Transport.start('+0');
		} else {
			Tone.start().then(() => {
				this.setState({ audioAvailable: true })
				precipPattern.start(0.001);
				tempPattern.start(0.002);
				if(this.getValByIndex(this.state.iceAvg, 0) !== 0){
					icePattern.start(0);
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
		const note0 = this.getNoteByVal(0, val1, index, data1);
		const note1 = this.getNoteByVal(0, val2, index, data2);
		const note2 = this.getNoteByVal(0, val3, index, data3);
		this.setState({notePlaying:1});
		Tone.Transport.scheduleOnce((time) => {
			synth0.triggerAttackRelease(note0, '8n');
			synth1.triggerAttackRelease(note1, '8n');
			synth2.triggerAttackRelease(note2, '8n');
		}, '+0');
		Tone.Transport.scheduleOnce((time) => {
			this.setState({notePlaying:0});
		}, '+8n');
		Tone.Transport.scheduleOnce((time) => {
			synth0.dispose();
			synth1.dispose();
			synth2.dispose();
		}, '+4n');
	}
    
    getTogetherStyles(mw, ch, cw) {
    	var modelWidth = mw;
    	var controlHeight = ch;
    	var controlWidth = cw;
    	var newh = controlHeight * 4 / 20;
    	if(this.state.CONTROLVERTDIV !== 1){
    		newh /= (1 - this.state.CONTROLVERTDIV)
    	}
    
    	var largeControlBlockStyle = {
    		height: Math.floor(newh),
    		width: Math.floor(controlWidth * this.state.CONTROLSPLIT),
    		overflow: 'hidden',
    		float: 'left'
    	}
    
    	const dataThirdStyle = {
    		width: Math.floor(modelWidth / 3),
    		height: Math.floor(this.state.pageBottom * this.state.DATAVERTDIV),
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
    	return { largeControlBlockStyle, dataThirdStyle, graphHeight, graphWidth };
    }
    
    updateYearVals = () => {
    	if(this.state.play === 0){
    		this.doYearHits(this.state.index + 1920);
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

    /*** runs on state update ***/   
    render(){
    
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
    
    const { modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, halfControlStyle, inputControlStyle, bigLabelControlStyle, labelControlStyle, dropdownControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer } = this.getCommonStyles();
    
    const { largeControlBlockStyle, dataThirdStyle, graphHeight, graphWidth } = this.getTogetherStyles(modelWidth, controlHeight, controlWidth );
    
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
				<p style={paragraphTextStyle}>1. Touch the map to select a location<br/>2. Touch the timeline to select a starting year<br/>3. Press the play button.<br/>4. Select a tempo</p>
			</div>
			
			<div style={controlBlockStyle}>
				{/* This originally used this.handleClick().  I may still need to use the game
				handler here.  But I might be able to just use the inhereted play method.  I think
				I will need to use some methods in this file too.  I'm just not sure which ones yet */}
				<div style={playSplitDivStyle} onPointerDown={this.state.play ? () => this.stopMusic() : () => this.playMusic()}>
					<img style={playSplitDivStyle} alt="play button" src={this.state.playButton}/>
				</div>
				
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
			
			<form>	
				<div style={dataBlockStyle}>
					<label htmlFor='lat' style={labelControlStyle}> Lat:</label>
					<input type='text' style={inputControlStyle} id='lat' value={this.state.latitude} onChange={this.onChangeLat}/>
					<label htmlFor='lon' style={labelControlStyle}> Lon:</label>
					<input type='text' style={inputControlStyle} id='lon' value={this.state.longitude} onChange={this.onChangeLon} />
				</div>
			
				<div style={dataBlockStyle}>
					<label htmlFor='city' style={bigLabelControlStyle}> City:</label>
					<select name='city' id='city' style={dropdownControlStyle} value={this.state.closestCity} onChange={this.changeToCity}>
						<option value='San Francisco'>San Francisco</option>
						<option value='Denver'>Denver</option>
						<option value='Hong Kong'>Hong Kong</option>
						<option value='Tokyo'>Tokyo</option>
						<option value='Bengaluru'>Bengaluru</option>
						<option value='Sydney'>Syney</option>
						<option value='Sao Paulo'>Sao Paulo</option>
						<option value='Cape Town'>Cape Town</option>
						<option value='London'>London</option>
						<option value='Berlin'>Berlin</option>
						<option value='Paris'>Paris</option>
						<option value='Rome'>Rome</option>
					</select>
				</div>
			</form>
			
		</div>
			
		<div style={controlContainerStyle}>
		
			<div style={dataBlockStyle}>
				<div style={halfControlStyle}>
					<p style={smallLabelTextStyle}>Year: {this.state.index + 1920}</p>
				</div>
				<div style={halfControlStyle}>
					<p style={smallLabelTextStyle}>Co2: {co2val}</p>
				</div>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} alt="graph key" src={graphKey}/>
			</div>
			
			
			<div style={keyContainer} >
				<div style={dataBlockStyle} onPointerDown={this.setupPrecipTransport} onPointerMove={this.testPrecipMusic} onPointerUp={this.killTransport}>
					<img style={dataBlockStyle} alt="precipitation key" src={precipKey} draggable="false"/>
				</div>

				<div style={dataBlockStyle} onPointerDown={this.setupTempTransport} onPointerMove={this.testTempMusic} onPointerUp={this.killTransport}>
					<img style={dataBlockStyle} alt="temperature key" src={tempKey} draggable="false"/>
				</div>

				<div style={controlBlockStyle} onPointerDown={this.setupIceTransport}  onPointerMove={this.testIceMusic} onPointerUp={this.killTransport}>
					<img style={dataBlockStyle} alt="sea ice key" src={iceKey} draggable="false"/>
				</div>
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
					<p style={smallLabelTextStyle}>Precip: {precip_val}</p>
				</div>
				<div style={dataThirdStyle}>
					<p style={smallLabelTextStyle}>Temp: {temp_val}</p>
				</div>
				<div style={dataThirdStyle}>
					<p style={smallLabelTextStyle}>Sea Ice: {ice_val}</p>
				</div>
			</div>
			
			<div style={graphStyle}>
				<canvas ref={this.graphRef} height={graphHeight} width={graphWidth} />
			</div>
			
			<div style={graphBufferStyle}/>
			
			<div style={sliderDivStyle} onPointerUp={this.updateYearVals}>
				<input style={sliderStyle} type="range" min="0" max="180" value={this.state.index} step="1" onChange={this.handleYear} />
				<img style={sliderStyle} alt="" src={timelineImg}/>
			</div>
			
		</div>  
		
    	</div> 
     );
     }
}


/*** class wrapper for naviagion functionality ***/
export default function AllTogetherWrapper(props){
    const navigation = useNavigation();

    return <AllTogether {...props} navigation={navigation} />;
}
