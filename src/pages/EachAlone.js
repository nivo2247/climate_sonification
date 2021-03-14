import { Image } from "react-native";
import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { isBrowser } from 'react-device-detect';
import { Simulation } from './Simulation.js';
import * as Tone from 'tone';

import { precipImgs, tempImgs, iceImgs, dbUrl, urlPre, precipActive, precipInactive, tempActive, tempInactive, iceActive, iceInactive, precipKey, tempKey, iceKey, homeButton, graphKey, topSkinnyImgAlone, bottomSkinnyImgAlone, timelineImg, aloneArtifactImgs, pauseUrl } from './../const/url.js';

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

/*** EachAlone Class, returns interactive page
*** Many items inherited from Simulation Class ***/
class EachAlone extends Simulation {
    constructor(props){
    super(props)
       	this.state.yearData = [0];
    	this.state.coordData = [0];        	
    	this.state.state = 0;
    	this.state.modelStr = "/precip/precip_ens";
    	this.state.precipSrc = precipActive;
    	this.state.tempSrc = tempInactive;
    	this.state.iceSrc = iceInactive;
    	this.state.keySrc = precipKey;
    	this.state.precipBool = 1;
    	this.state.tempBool = 0;
    	this.state.iceBool = 0;
    }
    
    /*** onPress for 'Precipitation' Button ***/  
    setPrecip = () => {
	/* change page vars */
	this.setState({ 
        	state: 0,
    		modelStr: "/precip/precip_ens",
        	precipSrc: precipActive,
    		tempSrc: tempInactive,
    		iceSrc: iceInactive,
    		keySrc: precipKey
    	});
    	/* setup graph and query db */
    	this.setupGraph();
    	this.doYearHits(0, this.state.index + 1920);
    	this.doCoordHits(0, this.state.latitude, this.state.longitude);
    }
   
    /*** onPress for 'Temperature' Button ***/   
    setTemp = () => {
	this.setState({
	        state: 1,
    		modelStr: "/temp/temp_ens",
    		precipSrc: precipInactive,
    		tempSrc: tempActive,
        	iceSrc: iceInactive,
    		keySrc: tempKey,
    		tempBool: 1
    	});
    	if(this.state.tempBool === 0){
    		tempImgs.forEach((picture) => {
    			Image.prefetch(picture);
    		});
    	}
    	this.setupGraph();
    	this.doYearHits(1, this.state.index + 1920);
    	this.doCoordHits(1, this.state.latitude, this.state.longitude);
    }

    /*** onPress for 'Sea Ice' Button ***/       
    setIce = () => {
    	this.setState({
        	state: 2,
    		modelStr: "/seaIce/ice_ens",
    		precipSrc: precipInactive,
        	tempSrc: tempInactive,
    		iceSrc: iceActive,
    		keySrc: iceKey,
    		iceBool: 1
    	});
    	if(this.state.iceBool === 0){
    		iceImgs.forEach((picture) => {
    			Image.prefetch(picture);
    		});
    	}
    	this.setupGraph();
    	this.doYearHits(2, this.state.index + 1920);
    	this.doCoordHits(2, this.state.latitude, this.state.longitude);
    }

    /*** Queries db upon mouse/finger release from map, only if simulation stopped ***/
    onPointerUp = (e) => {
    	if(this.state.play === 0){
    		this.doCoordHits(this.state.state, this.state.latitude, this.state.longitude);
    	}
    }
    
    /*** Used to calculate coords pressed on the map
    *** Leave this alone unless messing with DIV sizing ***/
    onMouseDown = (e) => {
    	/* A bunch of variables used to calculate mouse position */
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
    	if(this.state.play === 0 && e.buttons === 1) {
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
    		
    		if (this.state.state === 0 || this.state.state === 1) {
		    	lonSave = (x - centerX) * 360 / modelDiv;
		    	latSave = (centerY - y) * 180 / modelSplit;
		}
		else if (this.state.state === 2) {
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
    
    /*** Writes data to the graph, will need to be checked after music implementation ***/
    updateGraph() {
	if (this.state.index > 0 && this.state.index <= 180){
    	        var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    		var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
	    	const ctx = this.graphRef.current.getContext('2d');
	    	
    		var bottom = graphBottom - 1;
    		var right = modelWidth - 1;
    		
    		var step = right / 180;
    		var avg = bottom / 2;
    		
    		var prev_val = 0;
    		var coord_val = 0;
    		
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
    		
    		if(this.state.state === 0){
    			var precip_median = 100;
    			var precip_max = 120;
    		
    			ctx.beginPath();
    			for(var precipInd = 0; precipInd <= this.state.index; precipInd++){
    				prev_val = this.getValByIndex(this.state.coordData, precipInd - 1);
    				coord_val = this.getValByIndex(this.state.coordData, precipInd);
    			
    				ctx.moveTo(1 + step * (precipInd - 1), avg + avg * ((precip_median - prev_val) / precip_max));
    				ctx.lineTo(1 + step * precipInd, avg + avg * ((precip_median - coord_val) / precip_max));
    				ctx.strokeStyle = "green";
    			}
    			ctx.stroke();
    		}
    		
    		if(this.state.state === 1){
    		var temp_median = 0;
    		var temp_max = 20;
    		var temp_avg = Math.floor(avg * 1.5);
    		
    		ctx.beginPath();
    		for(var tempInd = 0; tempInd <= this.state.index; tempInd++){
    		    	prev_val = this.getValByIndex(this.state.coordData, tempInd - 1);
    			coord_val = this.getValByIndex(this.state.coordData, tempInd);
    			
    			ctx.moveTo(1 + step * (tempInd - 1), temp_avg + temp_avg * ((temp_median - prev_val) / temp_max));
    			ctx.lineTo(1 + step * tempInd, temp_avg + temp_avg * ((temp_median - coord_val) / temp_max));
    			ctx.strokeStyle = "red";
    		}
    		ctx.stroke();
    		}
    		
    		
    		if(this.state.state === 2) {
    		var ice_max = 1;
    		var ice_avg = Math.floor(avg * 0.5);
    		
    		ctx.beginPath();
    		for(var iceInd = 0; iceInd <= this.state.index; iceInd++){
    		    	prev_val = this.getValByIndex(this.state.coordData, iceInd - 1);
    			coord_val = this.getValByIndex(this.state.coordData, iceInd);
    			
    			ctx.moveTo(1 + step * (iceInd - 1), ice_avg + 3 * ice_avg * ((ice_max - prev_val)));
    			ctx.lineTo(1 + step * iceInd, ice_avg + 3 * ice_avg * ((ice_max - coord_val)));
    			ctx.strokeStyle = "blue";
    		}
    		ctx.stroke(); 
    		}
    	}
    }
    
    /*** get the value of every coordinate at a specific state and year ***/
    doYearHits(state, year){
	/* Filter and do db hit here */
	if(year >= 1920 && year <= 2100){
		var table = dbUrl.concat("/table/")
		var intermediate = "";
		if(state === 0){
			intermediate = table.concat("precipavg/year/");
		}
		else if(state === 1){
			intermediate = table.concat("tempavg/year/");
		}
		else if(state === 2){
			intermediate = table.concat("seaiceavg/year/");
		}
		var request = intermediate.concat(year.toString(10));
		Axios.get(request)
			.then(res => {
    			const year_data = res.data.data;
    			if(this.state.play === 0){
    				this.setState({ 
    					yearData: [...year_data],
    					useArray: 3
    				});
    			}
    			else{
    				this.setState({ yearData: [...year_data]});
    			}
    			console.log(year_data);
    		});
	}
    };
    
    /*** Templates for functions which would change the text of lat and lon from textbox input ***/
    onChangeLat = (event) => {
    	var newval = event.target.value;
    	if(this.state.play === 0 && isNumeric(newval)){
    		var parsedval = parseInt(newval);
    		if(parsedval >= -89 && parsedval <= 89){
    			this.doCoordHits(this.state.state, parsedval, this.state.longitude);
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
    			this.doCoordHits(this.state.state, this.state.latitude, parsedval);
    			this.setState({
    				longitude: parsedval,
    				useArray: 0
    			});	
    			this.setupGraph();
    		}
    	}
    }
    
    /*** Get the value of every year of a coords lifespan ***/
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
		if(state === 0){
			intermediate = table.concat("precipavg/coord/(");
		}
		else if(state === 1){
			intermediate = table.concat("tempavg/coord/(");
		}
		else if(state === 2){
			intermediate = table.concat("seaiceavg/coord/(");
		}
		var request = intermediate.concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		
		Axios.get(request)
			.then(res => {
    			const coord_data = res.data.data;
    			this.setState({ coordData: [...coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(coord_data);
    			if(this.state.state === 0){
    				this.setPrecipNotes(coord_data);
    			}else if(this.state.state === 1){
    				this.setTempNotes(coord_data);
    			}else if(this.state.state === 2){
    				this.setIceNotes(coord_data);
    			}
    		});
	}
    };
    
    setupTransport = (e) => {
    		Tone.Transport.start('+0');
    		this.testMusic(e);
    }

    /*** This is an onPointerDown for the map keys.
    *** When a user clicks the key, it should figure out
    *** what value they are pressing and pay the corresponding note ***/
    testMusic = (e) => {
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
   		if(this.state.state === 0){
   			playVal = (percX - .175) * 500 + 100;
   		}
   		else if(this.state.state === 1){
   			playVal = (percX - .14) * 23;
   		}
   		else if(this.state.state === 2){
   			playVal = percX;
   		}
   		this.playNoteByVal(this.state.state, playVal, this.state.index, this.state.coordData);
   	}
    }
    
    noteHelper = () => {
    	var notes = [];
    	if(this.state.state === 0){
		notes = this.getPrecipNotes(this.state.index);
	}
	
	else if(this.state.state === 1){
		notes = this.getTempNotes(this.state.index);
	}
	
	else{
		notes = this.getIceNotes(this.state.index);
	}
	return notes;
    }
    
    playMusic = () => {
		const synth = this.getSynth(this.state.state);
		this.setState( { play: 1, playButton: pauseUrl, useArray: 3 });
		const notes = this.noteHelper();
		
		const notePattern = new Tone.Sequence((time, note) => {
			synth.triggerAttackRelease(note, '8n', time);
			// bind incrementing
			Tone.Draw.schedule(() => {
				this.incrementIndex();
			}, time)
		}, notes);
		
		// catches most errors
		if(this.state.audioAvailable) {
			notePattern.start(0);
			Tone.Transport.start('+0');
		} else {
			Tone.start().then(() => {
				this.setState({ audioAvailable: true })
				notePattern.start(0);
				Tone.Transport.start('+0');
			}).catch(error => console.error(error));
		}
	}
    
    /*** runs on initial render ***/
    componentDidMount = () => {
    	this.setState({ co2data: [...this.props.route.params.co2data]});
    	
	this.setState({
		pageBottomMax: window.innerHeight,
		pageRightMax: window.innerWidth
	
	});
	
	/* preload artifacts and simulation images */
	aloneArtifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});	
	precipImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    	
    	/* setup event listeners for dynamic page resizing */
    	if(isBrowser){
		window.addEventListener('resize', this.updateDimensions);
	}
	window.addEventListener('orientationchange', this.rotateDimensions);
	
	/* fetch data and setup window size */
	this.doCoordHits(0, 0, 0);
	this.doYearHits(0, this.state.index + 1920);
	this.updateDimensions();
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
    
    /*** Get db value ***/
    var coord_val = 0;
    /* if useArray == 3, use the dataset that contains all years of a coord */
    if(this.state.useArray === 3){
    	coord_val = this.getValByIndex(this.state.coordData, this.state.index);
    	
    }
    /* use the dataset that contains all coords at a specific year */
    else {
        var coord_index = (dbY - 1) * 320 + (dbX - 1);
    	if(this.state.yearData.length > coord_index){
    		coord_val = this.getValByCoord(this.state.yearData, coord_index);
    	}
    }
    
    /* contains almost all the styling for the page */
    const { modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, inputControlStyle, labelControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer } = this.getCommonStyles();
    
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
				<p style={paragraphTextStyle}>1.Select a variable below<br/>2. Touch the map to select a location<br/>3. Touch the timeline to select a starting year.<br/>4. Press the play button.<br/>5. Select a tempo</p>
			</div>
			
			<div style={dataBlockStyle}>
				
				<div style={thirdControlStyle} onPointerUp={() => this.setPrecip()}>
					<img style={thirdControlStyle} alt="select precipitation" src={this.state.precipSrc}/>
				</div>
				
				<div style={thirdControlStyle} onPointerUp={() => this.setTemp()}>
					<img style={thirdControlStyle} alt="select temperature" src={this.state.tempSrc}/>
				</div>
				
				<div style={thirdControlStyle} onPointerUp={() => this.setIce()}>
					<img style={thirdControlStyle} alt="select sea ice" src={this.state.iceSrc}/>
				</div>
				
			</div>
			
			<div style={controlBlockStyle}>
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
			
		</div>
			
		<div style={controlContainerStyle}>
			<form>	
				<div style={dataBlockStyle}>
					<label for='lat' style={labelControlStyle}> Lat:</label>
					<input type='text' style={inputControlStyle} id='lat' value={this.state.latitude} onChange={this.onChangeLat}/>
					<label for='lon' style={labelControlStyle}> Lon:</label>
					<input type='text' style={inputControlStyle} id='lon' value={this.state.longitude} onChange={this.onChangeLon} />
				</div>
			</form>
			
			<div style={dataBlockStyle}>
					<p style={smallLabelTextStyle}> Year: {this.state.index + 1920}</p>
			</div>
			
			<div style={dataBlockStyle}>
				<p style={smallLabelTextStyle}>Co2: {co2val}</p>
			</div>
			
			<div style={controlBlockStyle} onPointerEnter={this.setupTransport} onPointerMove={this.testMusic} onPointerLeave={this.killTransport}>
				<img style={dataBlockStyle} alt="map key" src={this.state.keySrc} draggable="false"/>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} alt="graph key" src={graphKey}/>
			</div>
		</div>
		</div>
		
		<div style={skinnyDivStyle}>
			<img style={skinnyImgStyle} alt="" src={topSkinnyImgAlone} draggable="false"/>
			<img style={skinnyImgStyle} alt="" src={bottomSkinnyImgAlone} draggable="false"/>
		</div>
		
		<div style={largeDivStyle}>
			
			<div style={modelStyle} onPointerDown={this.onMouseDown} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>
				<img src={fullUrl} alt="climate model" style={modelStyle} draggable="false"/>
			</div>
			
			<div style={graphBufferStyle}>
				<p style={smallLabelTextStyle}>Avg Val: {coord_val}</p>
			</div>
			
			<div style={graphStyle}>
				<canvas ref={this.graphRef} height={this.state.pageBottom * this.state.GRAPHVERTDIV} width={modelWidth} />
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
export default function EachAloneWrapper(props){
    const navigation = useNavigation();

    return <EachAlone {...props} navigation={navigation} />;
}
