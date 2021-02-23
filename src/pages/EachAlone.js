import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, TouchableHighlight, TextInput } from "react-native";
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


/*** EachAlone specific stylesheet ***/
var styles = StyleSheet.create({
	container: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		flexDirection: 'row'
	},

	image: {
		flex: 1,
		resizeMode: 'contain'
	},
	
	tempoButton: {
		alignItems: 'center',
		backgroundColor: '#DDDDDD'
	},
	
	activeTempoButton: {
		alignItems: 'center',
		backgroundColor: '#88DD88'
	},
	
	tempoButtonContainer: {
		flex: 0.25,
		paddingHorizontal: 5,
		justifyContent: 'center'
	},

	title_text: {
		fontWeight: 'bold',
		fontSize: (Dimensions.get('window').height / 15 + Dimensions.get('window').width / 40),
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center',
		textShadowColor: 'rgba(0, 0,0, 1)',
		textShadowOffset: {width: -1, height: 1},
		textShadowRadius: 10
	}
});


/*** Game Handler Block (recieves page state):  
***  if play=1, increment index with delay in loop
***  else interrupt loop			 ***/

const timer = ms => new Promise(res => setTimeout(res, ms));

var gameHandler = async function(msg, data) {
	if (data.state.play == 1){
		while(data.state.index < 180){
			if(data.state.play == 1){
    				data.setState({
    					index: data.state.index+1, 
    					playButton: pauseUrl
   				});
   				await timer(data.state.timerLen);
   			}else{
   					return;
   			}
   		}
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
    		adagioStyle: styles.tempoButton,
    		moderatoStyle: styles.activeTempoButton,
    		allegroStyle: styles.tempoButton,
    		prestoStyle: styles.tempoButton,
    		latitude: 0,
    		longitude: 0,
    		modelWidth: Math.floor(Dimensions.get('window').width * 3/4),
		modelHeight: Math.floor(Dimensions.get('window').height * 3/4),
		modelLeft: Math.floor(Dimensions.get('window').width * 1/4),
		modelDiv: Math.floor(Dimensions.get('window').width * 1/4),
		modelSplit: Math.floor(Dimensions.get('window').height * 3/8)
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
    	this.setState({
    		timerLen: 1200,
    		adagioStyle: styles.activeTempoButton,
    		moderatoStyle: styles.tempoButton,
		allegroStyle: styles.tempoButton,
		prestoStyle: styles.tempoButton
    		});
    }
    
    /*** onPress for 'moderato' ***/   
    setModerato = () => {
    	this.setState({
    		timerLen: 800,
    		adagioStyle: styles.tempoButton,
    		moderatoStyle: styles.activeTempoButton,
		allegroStyle: styles.tempoButton,
		prestoStyle: styles.tempoButton
		});
    }
    
    /*** onPress for 'allegro' ***/   
    setAllegro = () => {
    	this.setState({
    		timerLen: 400,
    		adagioStyle: styles.tempoButton,
    		moderatoStyle: styles.tempoButton,
		allegroStyle: styles.activeTempoButton,
		prestoStyle: styles.tempoButton
    		});
    }
    
    /*** onPress for 'presto' ***/   
    setPresto = () => {
    	this.setState({
    		timerLen: 200,
    	    	adagioStyle: styles.tempoButton,
    		moderatoStyle: styles.tempoButton,
		allegroStyle: styles.tempoButton,
		prestoStyle: styles.activeTempoButton
		});
    }
    
    /*** onPress for 'Play/Pause' 
    *** publish the state, recieved by gameHandler     ***/   
    handleClick = () => {
    	this.setupGraph();
    	var newState = (this.state.play + 1) % 2;
    	this.setState({play: newState });
    	
    	if(newState == 0){
    		this.doYearHits(this.state.state, this.state.index + 1920);
    	}else if(newState == 1){
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
    
    
    /*** Used to calculate coords for onMouseDown and onMouseMove ***/
    onMouseDown = (e) => {
    	var x = e.clientX - this.state.modelLeft;
    	var y = e.clientY;
    	var latSave = 0;
    	var lonSave = 0;
    	var centerX = 0;
    	var centerY = 0;
    	if(this.state.play == 0 && e.buttons == 1) {
		if (x <= this.state.modelDiv && y <= this.state.modelSplit) {
	    		centerX = this.state.modelDiv / 2;
	    		centerY = this.state.modelSplit / 2;
		}
    		else if (x <= this.state.modelDiv * 2 && y <= this.state.modelSplit){
			centerX = this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit / 2;	
    		}
    		else if (x <= this.state.modelDiv * 3 && y <= this.state.modelSplit){
			centerX = 2 * this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit / 2;
    		}
    		else if (x <= this.state.modelDiv && y <= this.state.modelSplit * 2){
			centerX = this.state.modelDiv / 2;
    			centerY = this.state.modelSplit + this.state.modelSplit / 2;   	
    		}
    		else if (x <= this.state.modelDiv * 2 && y <= this.state.modelSplit * 2){
			centerX = this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit + this.state.modelSplit / 2;   	
    		}
    		else if (x <= this.state.modelDiv * 3 && y <= this.state.modelSplit * 2){
			centerX = 2 * this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit + this.state.modelSplit / 2;    	
    		}
    		
    		if (this.state.state == 0 || this.state.state == 1) {
		    	lonSave = (x - centerX) * 360 / this.state.modelDiv;
		    	latSave = (centerY - y) * 180 / this.state.modelSplit;
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
			lonSave = (projx - centerX) * 540 / this.state.modelDiv;
		    	latSave = 90 - projy * 90 / this.state.modelSplit;
		    	
			/*
			console.log("cx: ", centerX, "   x: ", x, "    dx: ", dx);
			console.log("cy: ", centerY, "   y: ", y, "    dy: ", dy); */
			console.log("r: ", r, "   theta: ", theta);
			console.log("px: ", projx, "py: ", projy);
		}
	    	this.setState({latitude: Math.floor(latSave), longitude: Math.floor(lonSave)});
	        }
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
    	
	this.setState({token: PubSub.subscribe('TOPIC', gameHandler)});
	
	artifactImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
	
	this.setupGraph();
	this.doCoordHits(0, 0, 0);
	this.doYearHits(0, this.state.index + 1920);

    }   
       
    setupGraph() {
    	const ctx = this.refs.models.getContext('2d');
    	var bottom = this.state.modelSplit / 2 - 1;
    	var right = this.state.modelWidth - 1;
    	
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
	    	const ctx = this.refs.models.getContext('2d');
	    	
    		var bottom = this.state.modelSplit / 2 - 1;
    		var right = this.state.modelWidth - 1;
    		
    		var step = right / 180;
    		var avg = bottom / 2;
    		
    		if(this.state.state == 0){
    			var precip_median = 100;
    			var precip_max = 120;
    		
    			ctx.beginPath();
    			for(var precipInd = 1; precipInd < this.state.index; precipInd++){
    			    	var precipAvgKeys = Object.keys(this.state.coordData[0]);
    				var usePrecipAvgKey = precipAvgKeys[precipInd - 1];
    				var prev_val = this.state.coordData[0][usePrecipAvgKey];
    				
    				var precipAvgKeys1 = Object.keys(this.state.coordData[0]);
    				var usePrecipAvgKey1 = precipAvgKeys1[precipInd];
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
    			var useTempAvgKey = tempAvgKeys[tempInd - 1];
    			var prev_val = this.state.coordData[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.coordData[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd];
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
    			var useIceAvgKey = iceAvgKeys[iceInd - 1];
    			var prev_val = this.state.coordData[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.coordData[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd];
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
    	this.setState({index: parseInt(event.target.value)});
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
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
    
    var co2val = this.state.co2data[this.state.index].co2_val;
    
    /*** setup model URL ***/
    var urlAdd = urlPre.concat(this.state.modelStr);
    var ind = this.state.index.toString();
    var suffix = ind.concat(".jpg");
    var fullUrl = urlAdd.concat(suffix);
    
    /*** Avg db value ***/
    var coord_val = 0;
    if(this.state.play == 1){
    	var avgKeys = Object.keys(this.state.coordData[0]);
    	var useAvgKey = avgKeys[this.state.index+1];
    	coord_val = this.state.coordData[0][useAvgKey];
    }else if(this.state.play == 0){
        var coord_index = (dbY - 1) * 240 + dbX;
    	if(this.state.yearData.length > coord_index){
    		var avgKeys = Object.keys(this.state.yearData[coord_index]);
    		var useAvgKey = avgKeys[1];
    		coord_val = this.state.yearData[coord_index][useAvgKey];
    	}
    	else{
    		console.log("dbx: ", dbX, " dbY: ", dbY);
    	}
    }
    
    /*** style for model images and div ***/
    const modelStyle = {
	width: this.state.modelWidth,
	height: this.state.modelHeight
    };
    
    this.updateGraph();
    
    /*** Return the page ***/
    return (
    	<View style={styles.container}>
    		<View style={{flex:0.2}}>
    			<TouchableOpacity onPress={() => navigation.navigate('Home')} style={{flex: 0.1}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"/>
				</View>
			</TouchableOpacity>
			
			<View style={{flex:0.05}}>
				<Text style={{fontWeight: 'bold', fontSize: 14}}>Instructions</Text>
				<Text style={{fontSize: 12}}>1.Select a variable below</Text>
			</View>
			
			<View style={{flex:0.05, flexDirection:'row'}}>
				<TouchableOpacity onPress={() => this.setPrecip()} style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source={this.state.precipSrc}/>
				</View>
				</TouchableOpacity>
				
				<TouchableOpacity onPress={() => this.setTemp()} style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source={this.state.tempSrc}/>
				</View>
				</TouchableOpacity>
				
				<TouchableOpacity onPress={() => this.setIce()} style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source={this.state.iceSrc}/>
				</View>
				</TouchableOpacity>
			</View>
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>2. Touch the map to select a location{"\n"}3. Touch the timeline to select a starting year.{"\n"}4. Press the play button.</Text>
			</View>
			
			<View style={{flex:0.1}}>
				<TouchableOpacity onPress={() => this.handleClick()} style={{flex: 1}}>
					<View style={{flex: 1}}>
						<Image style={styles.image} source={this.state.playButton}/>
					</View>
				</TouchableOpacity>
			</View>
			
			<View style={{flex:0.05}}>
				<Text style={{fontSize: 12}}>4. Select a tempo</Text>
			</View>
			
			<View style={{flex:0.05, flexDirection:'row'}}>
				<View  style={styles.tempoButtonContainer}>
					<TouchableHighlight style={this.state.adagioStyle} onPress={this.setAdagio}>
						<Text style={{fontSize:12}}>adagio</Text>
					</TouchableHighlight>
				</View>
				<View  style={styles.tempoButtonContainer}>
					<TouchableHighlight style={this.state.moderatoStyle} onPress={this.setModerato}>
						<Text style={{fontSize:12}}>moderato</Text>
					</TouchableHighlight>
				</View>
				<View  style={styles.tempoButtonContainer}>
					<TouchableHighlight style={this.state.allegroStyle} onPress={this.setAllegro}>
						<Text style={{fontSize:12}}>allegro</Text>
					</TouchableHighlight>
				</View>
				<View  style={styles.tempoButtonContainer}>
					<TouchableHighlight style={this.state.prestoStyle} onPress={this.setPresto}>
						<Text style={{fontSize:12}}>presto</Text>
					</TouchableHighlight>
				</View>
			</View>
			
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
			
			<View style={{flex:0.1, flexDirection: 'row'}}>
				<View style={{flex:0.5}}>
				<Text style={{fontSize: 12}}>Year{"\n"}{this.state.index + 1920}</Text>
				</View>
				
				<View style={{flex:0.5}}>
				<Text style={{fontSize: 12}}>CO2{"\n"}{co2val}</Text>
				</View>
			</View>
			
			<View style={{flex: 0.05, flexDirection: 'row'}}>
				<View style={{flex:1}}>
					<Text style={{textAlign: 'center', fontSize: 12}}>Avg Value: {coord_val}</Text> 
				</View>
			</View>
			
			<View style={{flex: 0.1, flexDirection: 'row'}}>
				<View style={{flex:1}}>
					<Image style={styles.image} source={this.state.keySrc} /> 
				</View>
			</View>
			
			<View style={{flex:0.2}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/linegraphkey1.png" /> 
			</View>
		</View>
		
		<View style={{flex:0.05}}>
			<View style={{flex:0.35}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/sidelabeltopMixed.png" /> 
			</View>
			<View style={{flex:0.35}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/sidelabelbottomMixed.png" /> 
			</View>
		</View>
		
		<View style={{flex:.75}}>
			<View style={{flex:0.75}}>
			<div style={modelStyle} onPointerDown={this.onMouseDown} onPointerMove={this.onMouseDown}>
				<img draggable="false" src={fullUrl} style={modelStyle}/>
			</div>
			</View>
			
			<View style={{flex:0.19}}>
				<canvas ref="models" height={this.state.modelSplit / 2} width={this.state.modelWidth} />
			</View>
			
			<View style={{flex:0.06}}>
				<input type="range" min="0" max="180" value={this.state.index} step="1" onChange={this.handleYear} />
			</View>
			
		</View>
    	</View>   
     );
     }
}


/*** class wrapper for naviagion functionality ***/
export default function(props){
    const navigation = useNavigation();

    return <EachAlone {...props} navigation={navigation} />;
}
