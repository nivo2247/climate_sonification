import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, TouchableHighlight } from "react-native";
import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Axios from 'axios';
import PubSub from 'pubsub-js';
import { precipImgs, tempImgs, iceImgs } from './../const/url.js';


/*** Links to AWS S3 media ***/
const modelsrc="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images";
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
	}
	else {
    		data.setState({
    			playButton: playUrl
    		});
    	}
	
};

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
    		iceBool: 0,  //Disabled because cache was getting to big. Need to figure that out.
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
    }
   
    /*** onPress for 'Temperature' ***/   
    setTemp = () => {
    if(this.state.tempBool == 0){
    	tempImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    }
    this.setState({
        state: 1,
    	modelStr: "/temp/temp_ens",
    	precipSrc: precipInactive,
    	tempSrc: tempActive,
        iceSrc: iceInactive,
    	keySrc: tempKey,
    	tempBool: 1
    });
    }

    /*** onPress for 'Sea Ice' ***/       
    setIce = () => {
    if(this.state.iceBool == 0){
    	iceImgs.forEach((picture) => {
    		Image.prefetch(picture);
    	});
    }
    this.setState({
        state: 2,
    	modelStr: "/seaIce/ice_ens",
    	precipSrc: precipInactive,
        tempSrc: tempInactive,
    	iceSrc: iceActive,
    	keySrc: iceKey,
    	iceBool: 1
    });
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
    	this.setState({play: ((this.state.play + 1) % 2) });
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
    	var dbX = 1;
    	var dbY = 1;
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
			lonSave = (projx - centerX) * 360 / this.state.modelDiv;
		    	latSave = (centerY - projy) * 180 / this.state.modelSplit;
			/*
			console.log("cx: ", centerX, "   x: ", x, "    dx: ", dx);
			console.log("cy: ", centerY, "   y: ", y, "    dy: ", dy); */
			console.log("r: ", r, "   theta: ", theta);
			console.log("px: ", projx, "py: ", projy);
		}
		
	    	dbX = Math.floor((90 - latSave) * 320 / 180);
	    	dbY= Math.floor((lonSave + 180) * 240 / 360);
	    	console.log("dbX: ", dbX);
	    	console.log("dbY: ", dbY);
	    		
		this.setState({
	    		longitude: Math.floor(lonSave),
	    		latitude: Math.floor(latSave)
	    		});
	        }
        }    
    
    /*** runs on initial render
    *** get CO2 values from DB
    *** preload images
    *** setup gameHandler as subscriber ***/
    componentDidMount = () => {
    	Axios.get('http://ec2-3-133-100-140.us-east-2.compute.amazonaws.com:4040/co2/all')
    	.then(res => {
    		const all_co2_data = res.data.data;
    		this.setState({ co2data: [...all_co2_data]});
    	});
    	
	this.setState({token: PubSub.subscribe('TOPIC', gameHandler)});
	
	this.updateModels();

    }   
       
    updateModels() {
    	const ctx = this.refs.models.getContext('2d');
    	ctx.beginPath();
    	ctx.moveTo(0, 0);
    	ctx.lineTo(0, (this.state.modelSplit / 2 - 1));
    	ctx.lineTo(this.state.modelWidth, (this.state.modelSplit / 2) - 1);
    	ctx.strokeStyle = "red";
    	ctx.stroke();
    	//ctx.fillRect(0, 0, this.state.modelWidth, this.state.modelSplit / 2);
    } 
    
    handleYear = (event) => {
    	this.setState({index: parseInt(event.target.value)});
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	PubSub.unsubscribe(this.state.token);
    }
    
    /*
    getCache = (input, needed) => {
    	needed.forEach((url) => {
    		if(!(url in input)){
    			Image.prefetch(url);
    			console.log("prefetch: ", url);
    		}
    	});
    }
    */

    /*** runs on state update ***/   
    render(){
    
    /*** This partially works for precip, but it call prefetch too many times ***/
    /*
    var checkUrls = precipImgs.slice(this.state.index, this.state.index+10);
    Image.queryCache(checkUrls)
    .then((data) => this.getCache(data, checkUrls)); */
    
    /*** store page stack info ***/
    const { navigation } = this.props;  
    
    console.log("ind ", this.state.index);
    
    var co2val = this.state.co2data[this.state.index].co2_val;
    
    /*** setup model URL ***/
    var urlAdd = urlPre.concat(this.state.modelStr);
    var ind = this.state.index.toString();
    var suffix = ind.concat(".jpg");
    var fullUrl = urlAdd.concat(suffix);
    
    /*** Avg db value ***/
    var coord_val = 0;
    
    /*** style for model images and div ***/
    const modelStyle = {
	width: this.state.modelWidth,
	height: this.state.modelHeight
    };
    
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
				<View style={{flex:0.5}}>
					<Text style={{fontSize: 12}}>Lat: {this.state.latitude}</Text>
				</View>
				<View style={{flex:0.5}}>
					<Text style={{fontSize: 12}}>Lon: {this.state.longitude}</Text>
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
			
			<View style={{flex:0.2}}>
				<canvas ref="models" height={this.state.modelSplit / 2} width={this.state.modelWidth} />
			</View>
			
			<View style={{flex:0.05}}>
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
