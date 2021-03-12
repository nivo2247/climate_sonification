import { Image } from "react-native";
import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { precipImgs, tempImgs, iceImgs, dbUrl } from './../const/url.js';
import { indexIncrementer, Simulation } from './Simulation.js';


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

/*** used to preload images in the page ***/
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
    	var x = Math.floor(e.clientX - modelLeft);
    	var y = Math.floor(e.clientY - modelTop);
    	
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
		    	
			/*
			console.log("cx: ", centerX, "   x: ", x, "    dx: ", dx);
			console.log("cy: ", centerY, "   y: ", y, "    dy: ", dy); */
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
    
    /*** onPress for 'Play/Pause' 
    *** publish the state, recieved by indexIncrementer     ***/   
    handleClick = () => {
    	var newIndex = this.state.index;
    	
    	/* handle game reset at year 2100 */
    	if(this.state.play === 0 && this.state.index === 180){
 		newIndex = 0;
 	}
    	var newState = (this.state.play + 1) % 2;
    	this.setState({
    		play: newState,
    		useArray: 3,
    		index: newIndex
    	});
    	
    	/* when pausing, we must grab data for entire map */
    	if(newState === 0){
    		this.doYearHits(this.state.state, this.state.index + 1920);
    	}

    	PubSub.publish('TOPIC', this);
    }
    
    /*** Writes data to the graph, will need to be checked after music implementation ***/
    updateGraph() {
	if (this.state.index > 0 && this.state.index <= 180){
    	        var graphBottom = Math.floor(this.state.pageBottom * this.state.GRAPHVERTDIV);
    		var modelWidth = Math.floor(this.state.pageRight * this.state.MAPDIV);
	    	const ctx = this.refs.models.getContext('2d');
	    	
    		var bottom = graphBottom - 1;
    		var right = modelWidth - 1;
    		
    		var step = right / 180;
    		var avg = bottom / 2;
    		
    		var prev_val = 0;
    		var coord_val = 0;
    		
    		if(this.state.state === 0){
    			var precip_median = 100;
    			var precip_max = 120;
    		
    			ctx.beginPath();
    			for(var precipInd = 0; precipInd <= this.state.index; precipInd++){
    			    	var precipAvgKeys = Object.keys(this.state.coordData[0]);
    				var usePrecipAvgKey = precipAvgKeys[precipInd + 1];
    				prev_val = this.state.coordData[0][usePrecipAvgKey];
    				
    				var precipAvgKeys1 = Object.keys(this.state.coordData[0]);
    				var usePrecipAvgKey1 = precipAvgKeys1[precipInd + 2];
    				coord_val = this.state.coordData[0][usePrecipAvgKey1];
    			
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
    		    	var tempAvgKeys = Object.keys(this.state.coordData[0]);
    			var useTempAvgKey = tempAvgKeys[tempInd + 1];
    			prev_val = this.state.coordData[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.coordData[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd + 2];
    			coord_val = this.state.coordData[0][useTempAvgKey1];
    			
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
    		    	var iceAvgKeys = Object.keys(this.state.coordData[0]);
    			var useIceAvgKey = iceAvgKeys[iceInd + 1];
    			prev_val = this.state.coordData[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.coordData[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd + 2];
    			coord_val = this.state.coordData[0][useIceAvgKey1];
    			
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
		console.log(request);
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
		console.log(request);
		Axios.get(request)
			.then(res => {
    			const coord_data = res.data.data;
    			this.setState({ coordData: [...coord_data]});
    			this.setupGraph();
    			this.updateGraph();
    			console.log(coord_data);
    		});
	}
	/* Filter and do db hit here */
    	console.log("dbX: ", dbX, "dbY: ", dbY);
    };

    /*** This is an onPointerDown for the map keys.
    *** When a user clicks the key, it should figure out
    *** what value they are pressing and pay the corresponding note ***/
    testMusic = (e) => {
    	if(e.buttons === 1){
    		console.log("TODO: Play note");
    	}
    }
    
    /*** runs on initial render ***/
    componentDidMount = () => {
    
    	/* create and send DB request for CO2 data */
    	var request = dbUrl.concat("/co2/all");
    	Axios.get(request)
    	.then(res => {
    		const all_co2_data = res.data.data;
    		this.setState({ co2data: [...all_co2_data]});
    	});
    	
    	/* setup subscriber indexIncrementer */
	this.setState({
		token: PubSub.subscribe('TOPIC', indexIncrementer)
	
	});
	
	/* preload artifacts and simulation images */
	artifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});	
	precipImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    	
    	/* setup event listeners for dynamic page resizing */
	window.addEventListener('resize', this.updateDimensions);
	window.addEventListener('orientationchange', this.rotateDimensions);
	
	/* fetch data and setup window size */
	this.doCoordHits(0, 0, 0);
	this.doYearHits(0, this.state.index + 1920);
	this.updateDimensions();
    } 
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
    	window.removeEventListener('resize', this.updateDimensions);
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
    		coord_val = this.getValByCoord(this.state.yearData, this.state.index);
    	}
    	/* catches OOB database requests */
    	else{
    		console.log("dbx: ", dbX, " dbY: ", dbY);
    	}
    }
    
    /* contains almost all the styling for the page */
    const { modelWidth, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer } = this.getCommonStyles();
    
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
				<img style={controlBlockStyle} alt="home button" src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"} />
			</div>
			
			<div style={largeControlBlockStyle}>
				<p style={instructionTextStyle}>Instructions</p>
				<p style={paragraphTextStyle}>1.Select a variable below<br/>2. Touch the map to select a location<br/>3. Touch the timeline to select a starting year.<br/>4. Press the play button.<br/>5. Select a tempo</p>
			</div>
			
			<div style={dataBlockStyle}>
				
				<div style={thirdControlStyle} onMouseDown={() => this.setPrecip()}>
					<img style={thirdControlStyle} alt="select precipitation" src={this.state.precipSrc}/>
				</div>
				
				<div style={thirdControlStyle} onMouseDown={() => this.setTemp()}>
					<img style={thirdControlStyle} alt="select temperature" src={this.state.tempSrc}/>
				</div>
				
				<div style={thirdControlStyle} onMouseDown={() => this.setIce()}>
					<img style={thirdControlStyle} alt="select sea ice" src={this.state.iceSrc}/>
				</div>
				
			</div>
			
			<div style={controlBlockStyle}>
				<div style={playSplitDivStyle} onPointerDown={() => this.handleClick()}>
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
			
			<div style={controlBlockStyle} onPointerDown={this.testMusic} onPointerMove={this.testMusic}>
				<img style={dataBlockStyle} alt="map key" src={this.state.keySrc} draggable="false"/>
			</div>
			
			<div style={keyContainer}>
				<img style={keyContainer} alt="graph key" src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/linegraphkey1.png"}/>
			</div>
		</div>
		</div>
		
		<div style={skinnyDivStyle}>
			<img style={skinnyImgStyle} alt="" src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_sidebar_advanced_part2.png"} draggable="false"/>
			<img style={skinnyImgStyle} alt="" src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_sidebar_advanced_part1.png"} draggable="false"/>
		</div>
		
		<div style={largeDivStyle}>
			
			<div style={modelStyle} onPointerDown={this.onMouseDown} onPointerMove={this.onMouseDown} onPointerUp={this.onPointerUp}>
				<img src={fullUrl} alt="climate model" style={modelStyle} draggable="false"/>
			</div>
			
			<div style={graphBufferStyle}>
				<p style={smallLabelTextStyle}>Avg Val: {coord_val}</p>
			</div>
			
			<div style={graphStyle}>
				<canvas ref="models" height={this.state.pageBottom * this.state.GRAPHVERTDIV} width={modelWidth} />
			</div>
			
			
			<div style={graphBufferStyle}/>
			
			<div style={sliderDivStyle}>
				<input style={sliderStyle} type="range" min="0" max="180" value={this.state.index} step="1" onChange={this.handleYear} />
				<img style={sliderStyle} alt="" src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/timelinenumbersimage.png"}/>
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
