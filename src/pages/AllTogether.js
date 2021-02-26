import { Image } from "react-native";
import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { combinedImgs, dbUrl } from './../const/url.js';
import { indexIncrementer, Simulation } from './Simulation.js'

//TODO: Make sure ALL Links are declared here
/*** Links to AWS S3 media ***/
const urlPre = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images";
const precipKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/precipLegend1.png";
const tempKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tempLegend2.png";
const iceKey = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/seaiceLegend.png";
const playUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png";
const pauseUrl = "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/stop.png";

//TODO: Verify this is all the images we need
/*** used to preload images in the page ***/
const artifactImgs = [
	precipKey,
	tempKey,
	iceKey,
	playUrl,
	pauseUrl
];

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
 	if(this.state.play == 0 && this.state.index == 180){
 		newIndex = 0;
 	}
    	var newState = (this.state.play + 1) % 2;
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
    
    /*** When map coord is selected, do db query ***/
    onPointerUp = (e) => {
    	if(this.state.play == 0){
    		this.doCoordHits(this.state.latitude, this.state.longitude);
    	}
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
    
    /*** runs on initial render ***/
    componentDidMount = () => {
    	var request = dbUrl.concat("/co2/all");
    	Axios.get(request)
    	.then(res => {
    		const all_co2_data = res.data.data;
    		this.setState({ co2data: [...all_co2_data]});
    	});
	this.setState({
		token: PubSub.subscribe('TOPIC', indexIncrementer)
	});
	
	artifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    	
    	combinedImgs.forEach((picture) => {
    			Image.prefetch(picture);
    	});
    	
	window.addEventListener('resize', this.updateDimensions);
	window.addEventListener('orientationchange', this.rotateDimensions);
	this.doCoordHits(0, 0);
	this.doYearHits(this.state.index + 1920);
	this.updateDimensions();
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
    		for(var precipInd = 0; precipInd <= this.state.index; precipInd++){
    		    	var precipAvgKeys = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey = precipAvgKeys[precipInd + 1];
    			var prev_val = this.state.precipAvg[0][usePrecipAvgKey];
    			
    			var precipAvgKeys1 = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey1 = precipAvgKeys1[precipInd + 2];
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
    		for(var tempInd = 0; tempInd <= this.state.index; tempInd++){
    		    	var tempAvgKeys = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey = tempAvgKeys[tempInd + 1];
    			var prev_val = this.state.tempAvg[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd + 2];
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
    		for(var iceInd = 0; iceInd <= this.state.index; iceInd++){
    		    	var iceAvgKeys = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey = iceAvgKeys[iceInd + 1];
    			var prev_val = this.state.iceAvg[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd + 2];
    			var coord_val = this.state.iceAvg[0][useIceAvgKey1];
    			
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
    
    const { modelWidth, modelHeight, modelLeft, modelDiv, modelSplit, modelStyle, controlHeight, controlWidth, containerStyle, controlContainerStyle, graphStyle, sliderDivStyle, sliderStyle, controlDivStyle, playSplitDivStyle, controlBlockStyle, dataBlockStyle, graphBufferStyle, instructionTextStyle, paragraphTextStyle, smallLabelTextStyle, quarterControlStyle, thirdControlStyle, skinnyDivStyle, largeDivStyle, skinnyImgStyle, adagioHighlight, moderatoHighlight, allegroHighlight, prestoHighlight, keyContainer } = this.getCommonStyles();
    
    var newh = controlHeight * 3 / 20;
    if(this.state.CONTROLVERTDIV != 1){
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
			
			<div style={controlBlockStyle}>
				<div style={playSplitDivStyle} onPointerDown={() => this.handleClick()}>
					<img style={playSplitDivStyle} src={this.state.playButton}/>
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
				<canvas ref="models" height={this.state.pageBottom * this.state.GRAPHVERTDIV} width={modelWidth} />
			</div>
			
			<div style={graphBufferStyle}/>
			
			<div style={sliderDivStyle}>
				<input style={sliderStyle} type="range" min="0" max="180" value={this.state.index} step="1" onChange={this.handleYear} />
				<img style={sliderStyle} src={"https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/timelinenumbersimage.png"}/>
			</div>
			
		</div>  
		
    	</div> 
     );
     }
}


/*** class wrapper for naviagion functionality ***/
export default function(props){
    const navigation = useNavigation();

    return <AllTogether {...props} navigation={navigation} />;
}
