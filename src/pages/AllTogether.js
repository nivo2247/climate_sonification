import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, TouchableHighlight, TextInput } from "react-native";
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
    		this.doYearHits(this.state.index + 1920);
    	}else if(newState == 1){
    		this.doCoordHits(this.state.latitude, this.state.longitude);
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
    	var boxType = 0;
    	if(this.state.play == 0 && e.buttons == 1) {
		if (x <= this.state.modelDiv && y <= this.state.modelSplit) {
	    		centerX = this.state.modelDiv / 2;
	    		centerY = this.state.modelSplit / 2;
	    		boxType = 1;
		}
    		else if (x <= this.state.modelDiv * 2 && y <= this.state.modelSplit){
			centerX = this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit / 2;
    			boxType = 1;	
    		}
    		else if (x <= this.state.modelDiv * 3 && y <= this.state.modelSplit){
			centerX = 2 * this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit / 2;
    			boxType = 2;
    		}
    		else if (x <= this.state.modelDiv && y <= this.state.modelSplit * 2){
			centerX = this.state.modelDiv / 2;
    			centerY = this.state.modelSplit + this.state.modelSplit / 2; 
    			boxType = 1;  	
    		}
    		else if (x <= this.state.modelDiv * 2 && y <= this.state.modelSplit * 2){
			centerX = this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit + this.state.modelSplit / 2; 
    			boxType = 1;  	
    		}
    		else if (x <= this.state.modelDiv * 3 && y <= this.state.modelSplit * 2){
			centerX = 2 * this.state.modelDiv + this.state.modelDiv / 2;
    			centerY = this.state.modelSplit + this.state.modelSplit / 2; 
    			boxType = 2;   	
    		}
    		
    		if (boxType == 1) {
		    	lonSave = (x - centerX) * 360 / this.state.modelDiv;
		    	latSave = (centerY - y) * 180 / this.state.modelSplit;
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
			lonSave = (projx - centerX) * 540 / this.state.modelDiv;
		    	latSave = 90 - projy * 90 / this.state.modelSplit;
			
			console.log("lats: ", latSave, "   lons: ", lonSave);
			
			//console.log("cx: ", centerX, "   x: ", x, "    dx: ", dx);
			//console.log("cy: ", centerY, "   y: ", y, "    dy: ", dy); 
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
    	
    	combinedImgs.forEach((picture) => {
    			Image.prefetch(picture);
    	});
	
	this.setupGraph();
	this.doCoordHits(0, 0);
	this.doYearHits(this.state.index + 1920);

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
    	
    		var precip_median = 100;
    		var precip_max = 500;
    		
    		ctx.beginPath();
    		for(var precipInd = 1; precipInd < this.state.index; precipInd++){
    		    	var precipAvgKeys = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey = precipAvgKeys[precipInd - 1];
    			var prev_val = this.state.precipAvg[0][usePrecipAvgKey];
    			
    			var precipAvgKeys1 = Object.keys(this.state.precipAvg[0]);
    			var usePrecipAvgKey1 = precipAvgKeys1[precipInd];
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
    		for(var tempInd = 1; tempInd < this.state.index; tempInd++){
    		    	var tempAvgKeys = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey = tempAvgKeys[tempInd - 1];
    			var prev_val = this.state.tempAvg[0][useTempAvgKey];
    			
    			var tempAvgKeys1 = Object.keys(this.state.tempAvg[0]);
    			var useTempAvgKey1 = tempAvgKeys1[tempInd];
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
    		for(var iceInd = 1; iceInd < this.state.index; iceInd++){
    		    	var iceAvgKeys = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey = iceAvgKeys[iceInd - 1];
    			var prev_val = this.state.iceAvg[0][useIceAvgKey];
    			
    			var iceAvgKeys1 = Object.keys(this.state.iceAvg[0]);
    			var useIceAvgKey1 = iceAvgKeys1[iceInd];
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
    			this.setState({ precipAvgAllCoords: [...precip_data]});
    			console.log(precip_data);
    		});
    		var intermediate1 = table.concat("tempavg/year/");
		var request1 = intermediate1.concat(year.toString(10));
		console.log(request1);
		Axios.get(request1)
			.then(res => {
    			const temp_data = res.data.data;
    			this.setState({ tempAvgAllCoords: [...temp_data]});
    			console.log(temp_data);
    		});
    		var intermediate2 = table.concat("seaiceavg/year/");
		var request2 = intermediate2.concat(year.toString(10));
		console.log(request2);
		Axios.get(request2)
			.then(res => {
    			const ice_data = res.data.data;
    			this.setState({ iceAvgAllCoords: [...ice_data]});
    			console.log(ice_data);
    		});
	}
    };
    
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
    		console.log(precip_coord_data);
    	});
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		var request = dbUrl.concat("/table/tempavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    		const temp_coord_data = res.data.data;
    		this.setState({ tempAvg: [...temp_coord_data]});
    		console.log(temp_coord_data);
    	});
	}
	if(dbX <= 320 && dbX >= 1 && dbY <= 240 && dbY >= 1){
		var request = dbUrl.concat("/table/seaiceavg/coord/(").concat(dbX.toString(10)).concat(", ").concat(dbY.toString(10)).concat(")");
		Axios.get(request)
    		.then(res => {
    		const seaice_coord_data = res.data.data;
    		this.setState({ iceAvg: [...seaice_coord_data]});
    		console.log(seaice_coord_data);
    	});
	}
	
    	console.log("dbX: ", dbX, "dbY: ", dbY);
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
    
    var co2val = this.state.co2data[this.state.index].co2_val;
    
    /*** setup model URL ***/
    var urlAdd = urlPre.concat(this.state.modelStr);
    var ind = this.state.index.toString();
    var suffix = ind.concat(".jpg");
    var fullUrl = urlAdd.concat(suffix);
    
    var precip_val = 0;
    var temp_val = 0;
    var ice_val = 0;
    
    /*** Set avg db values ***/
    if(this.state.play == 1){
    	var precipAvgKeys = Object.keys(this.state.precipAvg[0]);
    	var usePrecipAvgKey = precipAvgKeys[this.state.index+1];
    	precip_val = this.state.precipAvg[0][usePrecipAvgKey];
    
    	var tempAvgKeys = Object.keys(this.state.tempAvg[0]);
    	var useTempAvgKey = tempAvgKeys[this.state.index+1];
    	temp_val = this.state.tempAvg[0][useTempAvgKey];
    
    	var iceAvgKeys = Object.keys(this.state.iceAvg[0]);
    	var useIceAvgKey = iceAvgKeys[this.state.index+1];
    	ice_val = this.state.iceAvg[0][useIceAvgKey];
    }
    else if(this.state.play == 0){
    	var coord_index = (dbY - 1) * 240 + dbX;
    	if(this.state.precipAvgAllCoords.length > coord_index){
    		var avgKeys0 = Object.keys(this.state.precipAvgAllCoords[coord_index]);
    		var useAvgKey0 = avgKeys0[1];
    		precip_val = this.state.precipAvgAllCoords[coord_index][useAvgKey0];
    	}
    	if(this.state.tempAvgAllCoords.length > coord_index){
    		var avgKeys1 = Object.keys(this.state.tempAvgAllCoords[coord_index]);
    		var useAvgKey1 = avgKeys1[1];
    		temp_val = this.state.tempAvgAllCoords[coord_index][useAvgKey1];
    	}
    	if(this.state.iceAvgAllCoords.length > coord_index){
    		var avgKeys2 = Object.keys(this.state.iceAvgAllCoords[coord_index]);
    		var useAvgKey2 = avgKeys2[1];
    		ice_val = this.state.iceAvgAllCoords[coord_index][useAvgKey2];
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
			
			<View style={{flex:0.15}}>
				<Text style={{fontWeight: 'bold', fontSize: 14}}>Instructions</Text>
				<Text style={{fontSize: 12}}>1.Select a variable below</Text>
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
				<Text style={{fontSize: 12}}>5. Select a tempo</Text>
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
				<View style={{flex:0.33}}>
					<Text style={{textAlign: 'center', fontSize: 12}}>Precip: {"\n"}{precip_val}</Text> 
				</View>
				<View style={{flex:0.33}}>
					<Text style={{textAlign: 'center', fontSize: 12}}>Temp: {"\n"}{temp_val}</Text> 
				</View>
				<View style={{flex:0.33}}>
					<Text style={{textAlign: 'center', fontSize: 12}}>Sea Ice: {"\n"}{ice_val}</Text> 
				</View>
			</View>
			
			<View style={{flex: 0.05}}>
				<View style={{flex:1}}>
					<Image style={styles.image} source={precipKey} /> 
				</View>
			</View>
			
			<View style={{flex: 0.05}}>
				<View style={{flex:1}}>
					<Image style={styles.image} source={tempKey} /> 
				</View>
			</View>
			
			<View style={{flex: 0.05}}>
				<View style={{flex:1}}>
					<Image style={styles.image} source={iceKey} /> 
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
