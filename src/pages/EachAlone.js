import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity } from "react-native";
import * as React from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';



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


var styles = StyleSheet.create({
	container: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height
	},
	rcontainer: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		flexDirection: 'row'
	},

	start_buttons: {
		flex: 0.35,
		flexDirection: 'row',
	},
	info: {
		flex: 0.3,
		flexDirection: 'row',
	},

	image: {
		flex: 1,
		resizeMode: 'contain'
	},
	
	button: {
		flex: 1
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
	},
	desc_text: {
		fontSize: (Dimensions.get('window').height / 30 + Dimensions.get('window').width / 80),
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center',
		textShadowColor: 'rgba(0, 0,0, 1)',
		textShadowOffset: {width: -1, height: 1},
		textShadowRadius: 8
	}
});

export default function EachAlone( { route, navigation }) {
    const { modelType, index, state } = route.params;
    
    /* Attempt to load next image, code runs away, do not use
    if (state == 1){
    	setTimeout(() => { navigation.navigate('EachAlone', { modelType: modelType, index: index+1, state: state }); }, 2000);
    }*/

    var modelStr;
    var precipSrc;
    var tempSrc;
    var iceSrc;
    var keySrc;
    var playButton;
    
    var nextState = (state + 1) % 2;
    
    var year = 1920 + index;
    var yearStr = year.toString();
    
    var co2val = 390;
    
    if (state == 0){
    	playButton = playUrl;
    }
    else{
    	playButton = pauseUrl;
    }
    
    if (modelType == 0) {
    	modelStr="/precip/precip_ens";
    	precipSrc = precipActive;
    	tempSrc = tempInactive;
    	iceSrc = iceInactive;
    	keySrc = precipKey;
    }
    else if (modelType == 1){
    	modelStr="/temp/temp_ens";
    	precipSrc = precipInactive;
    	tempSrc = tempActive;
    	iceSrc = iceInactive;
    	keySrc = tempKey;
    }
    else{
    	modelStr="/seaIce/ice_ens";
    	precipSrc = precipInactive;
    	tempSrc = tempInactive;
    	iceSrc = iceActive;
    	keySrc = iceKey;
    }
    
    var urlAdd = urlPre.concat(modelStr);
    var ind = index.toString();
    var suffix = ind.concat(".jpg");
    var fullUrl = urlAdd.concat(suffix);
    
    return (
    	<View style={styles.rcontainer}>
    		<View style={{flex:0.2}}>
    			<TouchableOpacity onPress={() => navigation.navigate('Home')} style={{flex: 0.1}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"/>
				</View>
			</TouchableOpacity>
			
			<View style={{flex:0.07}}>
				<Text style={{fontWeight: 'bold', fontSize: 14}}>Instructions</Text>
				<Text style={{fontSize: 12}}>1.Select a variable below</Text>
			</View>
			
			<View style={{flex:0.07, flexDirection:'row'}}>
				<TouchableOpacity onPress={() => { navigation.navigate('EachAlone', { modelType: 0, index: 0, state: 0 }); }}  style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source={precipSrc}/>
				</View>
				</TouchableOpacity>
				
				<TouchableOpacity onPress={() => { navigation.navigate('EachAlone', { modelType: 1, index: 0, state: 0 }); }} style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source={tempSrc}/>
				</View>
				</TouchableOpacity>
				
				<TouchableOpacity onPress={() => { navigation.navigate('EachAlone', { modelType: 2, index: 0, state: 0 }); }} style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source={iceSrc}/>
				</View>
				</TouchableOpacity>
			</View>
			
			<View style={{flex:0.2}}>
				<Text style={{fontSize: 12}}>2. Touch the map to select a location{"\n"}3. Touch the timeline to select a starting year.{"\n"}4. Press the play button.</Text>
			</View>
			
			<View style={{flex:0.13}}>
				<TouchableOpacity onPress={() => { navigation.navigate('EachAlone', { modelType: modelType, index: index, state: nextState });}} style={{flex: 1}}>
					<View style={{flex: 1}}>
						<Image style={styles.image} source={playButton}/>
					</View>
				</TouchableOpacity>
			</View>
			
			<View style={{flex:0.05}}>
				<Text style={{fontSize: 12}}>4. Select a tempo</Text>
			</View>
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>TODO: Tempo Select</Text>
			</View>
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>TODO: Location Display</Text>
			</View>
			
			<View style={{flex:0.1, flexDirection: 'row'}}>
				<View style={{flex:0.5}}>
				<Text style={{fontSize: 12}}>Year{"\n"}{yearStr}</Text>
				</View>
				
				<View style={{flex:0.5}}>
				<Text style={{fontSize: 12}}>CO2{"\n"}{co2val}</Text>
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
		
		<View style={{flex:0.75}}>
			<View style={{flex:0.7}}>
				<Image style={styles.image} source={fullUrl} />
			</View>
			<View style={{flex: 0.1, flexDirection: 'row'}}>
				<View style={{flex:0.33}}>
					<Image style={styles.image} source={keySrc} /> 
				</View>
			</View>
			
			<View style={{flex:0.2}}>
				<Text style={styles.title_text}>Todo: Graph</Text>
			</View>
		</View>
    	</View>   
     );
}

