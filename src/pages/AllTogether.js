import { Image } from "react-native";
import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { isBrowser } from 'react-device-detect';
import { indexIncrementer, Simulation } from './Simulation.js';

import { combinedImgs, dbUrl, urlPre, precipKey, tempKey, iceKey, homeButton, graphKey, topSkinnyImg, bottomSkinnyImg, timelineImg, togetherArtifactImgs } from './../const/url.js';

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

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
    
    /*** onPress for 'Play/Pause' 
    *** publish the state, recieved by gameHandler     ***/   
    handleClick = () => {
    	var newIndex = this.state.index;
 	if(this.state.play === 0 && this.state.index === 180){
 		newIndex = 0;
 	}
    	var newState = (this.state.play + 1) % 2;
    	this.setState({
    		play: newState,
    		useArray: 3,
    		index: newIndex
    	});
    	
    	if(newState === 0){
    		this.doYearHits(this.state.index + 1920);
    	}
    	
    	PubSub.publish('TOPIC', this);
    }
    
    /* TODO: activates when clicking map keys, make this play test note */
    testMusic = (e) => {
    	if(e.buttons === 1){
    		var keyLeft = 0;
    		var keyRight = Math.floor(this.state.pageRight * this.state.CONTROLDIV);
    		var keyTop = Math.floor(this.state.pageBottom * 14 / 20);
    		var keyBottom = Math.floor(this.state.pageBottom * 17 / 20);
    		if(this.state.CONTROLVERTDIV !== 1){
    			keyLeft = this.state.pageRight / 2;
    			keyRight = this.state.pageRight;
    			keyTop = this.state.pageBottom * 17 / 80;
    			keyBottom = this.state.pageBottom * 25 / 80;
    		}
    		var x = e.pageX - keyLeft;
    		var y = e.pageY - keyTop;
    		var rangeX = keyRight - keyLeft;
    		var rangeY = keyBottom - keyTop;
   		var percX = x / rangeX;
   		var percY = y / rangeY;
   		var playVal;
   		if(percY <= 0.33){
   			playVal = (percX - .175) * 500 + 100;
   			console.log("playprecip: ", playVal);
   		}
   		else if(percY <= 0.66){
   			playVal = (percX - .14) * 23;
   			console.log("playtemp: ", playVal);
   		}
   		else if(percY <= 1){
   			playVal = percX;
   			console.log("playice: ", playVal);
   		}
   	}
    }
    
    /*** When map coord is selected, do db query ***/
    onPointerUp = (e) => {
    	if(this.state.play === 0){
    		this.doCoordHits(this.state.latitude, this.state.longitude);
    	}
    }
    
    /*** Used to calculate coords for onMouseDown and onMouseMove ***/
    onMouseDown = (e) => {
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
	    	this.setState({
	    		latitude: Math.floor(latSave), 
	    		longitude: Math.floor(lonSave),
	    		useArray: 0
	    		});	
	        }
        }    
    
    /*** runs on initial render ***/
    componentDidMount = () => {
    	this.setState({ co2data: [...this.props.route.params.co2data]});
    	
	this.setState({
		token: PubSub.subscribe('TOPIC', indexIncrementer)
	});
	
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
	this.updateDimensions();
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
    		    	var precipAvgKeys = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey = precipAvgKeys[precipInd + 1];
    			prev_val = this.state.precipAvg[0][usePrecipAvgKey];
    			
    			var precipAvgKeys1 = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey1 = precipAvgKeys1[precipInd + 2];
    			coord_val = this.state.precipAvg[0][usePrecipAvgKey1];
    			
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
    		    	var tempAvgKeys = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey = tempAvgKeys[tempInd + 1];
    			prev_val = this.state.tempAvg[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd + 2];
    			coord_val = this.state.tempAvg[0][useTempAvgKey1];
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_max));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_max));
    			ctx.strokeStyle = "red";
    		}
    		ctx.stroke();
    		
    		var ice_max = 1;
    		var ice_avg = Math.floor(avg * 0.5);
    		
    		ctx.beginPath();
    		for(var iceInd = 0; iceInd <= this.state.index; iceInd++){
    		    	var iceAvgKeys = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey = iceAvgKeys[iceInd + 1];
    			prev_val = this.state.iceAvg[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd + 2];
    			coord_val = this.state.iceAvg[0][useIceAvgKey1];
    			
    			ctx.moveTo(1 + step * (iceInd - 1), ice_avg + 3 * ice_avg * ((ice_max - prev_val)));
    			ctx.lineTo(1 + step * iceInd, ice_avg + 3 * ice_avg * ((ice_max - coord_val)));
    			ctx.strokeStyle = "blue";
    		}
    		ctx.stroke(); 
    	}
    }
    
    /*** query db for all coords at a specific year ***/
    doYearHits(year){
	if(year >= 1920 && year <= 2100){
		var table = dbUrl.concat("/table/")
		var intermediate0 = table.concat("precipavg/year/");
		var request0 = intermediate0.concat(year.toString(10));
		Axios.get(request0)
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
    		});
    		var intermediate1 = table.concat("tempavg/year/");
		var request1 = intermediate1.concat(year.toString(10));
		Axios.get(request1)
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
    		});
    		var intermediate2 = table.concat("seaiceavg/year/");
		var request2 = intermediate2.concat(year.toString(10));
		Axios.get(request2)
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
    		});
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
    		}
    	}
    }
    
    /*** query db for all years of a specific coord ***/
    doCoordHits(lat, lon){
    	var dbX = 1;
    	var dbY = 1;
    	dbY = Math.floor((91 - lat) * (240 / 180));
	dbX = Math.floor((181 + lon) * 320 / 360);
	this.setState({
		latitude: Math.floor(lat),
		longitude: Math.floor(lon)
	});
	var request;
	/* Filter and do db hit here */
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		request = dbUrl.concat("/table/precipavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    			const precip_coord_data = res.data.data;
    			this.setState({ precipAvg: [...precip_coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(precip_coord_data);
    			this.setPrecipNotes(precip_coord_data);
    		});
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		request = dbUrl.concat("/table/tempavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
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
		request = dbUrl.concat("/table/seaiceavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    			const seaice_coord_data = res.data.data;
    			this.setState({ iceAvg: [...seaice_coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(seaice_coord_data);
    		});
	}
    };
    
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
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
    	if(isBrowser){
    		window.removeEventListener('resize', this.updateDimensions);
    	}
    	window.removeEventListener('orientationchange', this.rotateDimensions);
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
    
    const { modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, inputControlStyle, labelControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer } = this.getCommonStyles();
    
    const { largeControlBlockStyle, dataThirdStyle, graphHeight, graphWidth } = this.getTogetherStyles(modelWidth, controlHeight, controlWidth );
    
    this.updateGraph();
    
    /*** Return the page ***/
    
    return (
    <div style={containerStyle}>
    		<div style={controlDivStyle}>
    		<div style={controlContainerStyle}>
			<div style={controlBlockStyle} onPointerDown={() => navigation.navigate('Home')}>
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
			</form>
			
			<div style={dataBlockStyle}>
				<p style={smallLabelTextStyle}> Year: {this.state.index + 1920}</p>
			</div>
			
		</div>
			
		<div style={controlContainerStyle}>
		
			<div style={dataBlockStyle}>
				<p style={smallLabelTextStyle}>Co2: {co2val}</p>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} alt="graph key" src={graphKey}/>
			</div>
			
			
			<div style={keyContainer} onPointerDown={this.testMusic} onPointerMove={this.testMusic}>
				<div style={dataBlockStyle}>
					<img style={dataBlockStyle} alt="precipitation key" src={precipKey} draggable="false"/>
				</div>

				<div style={dataBlockStyle}>
					<img style={dataBlockStyle} alt="temperature key" src={tempKey} draggable="false"/>
				</div>

				<div style={controlBlockStyle}>
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
			
			<div style={modelStyle} onPointerDown={this.onMouseDown} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>
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
			
			<div style={sliderDivStyle}>
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
