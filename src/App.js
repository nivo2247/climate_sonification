import './App.css';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


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

function onClick(){
	window.location.href="https://news.ucar.edu/123108/40-earths-ncars-large-ensemble-reveals-staggering-climate-variability";
};

function AllTogether( { navigation }) {
    return (
    	<View style={styles.rcontainer}>
    		<View style={{flex:0.2}}>
    			<TouchableOpacity onPress={() => navigation.navigate('Home')} style={{flex: 0.1}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"/>
				</View>
			</TouchableOpacity>
			
			<View style={{flex:0.2}}>
				<Text style={{fontWeight: 'bold', fontSize: 14}}>Instructions</Text>
				<Text style={{fontSize: 12}}>1. Touch the map to select a location{"\n"}2. Touch the timeline to select a starting year.{"\n"}3. Press the play button.</Text>
			</View>
			
			<View style={{flex:0.13}}>
				<TouchableOpacity onPress={() => navigation.navigate('Home')} style={{flex: 1}}>
					<View style={{flex: 1}}>
						<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png"/>
					</View>
				</TouchableOpacity>
			</View>
			
			<View style={{flex:0.07}}>
				<Text style={{fontSize: 12}}>4. Select a tempo</Text>
			</View>
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>TODO: Tempo Select</Text>
			</View>
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>TODO: Location Display</Text>
			</View>
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>TODO: Year/C02 Display</Text>
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
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/combined/combined_ens0.jpg" />
			</View>
			<View style={{flex: 0.1, flexDirection: 'row'}}>
				<View style={{flex:0.33}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/precipLegend1.png" /> 
				</View>
				<View style={{flex:0.33}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tempLegend2.png" /> 
				</View>
				<View style={{flex:0.33}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/seaiceLegend.png" /> 
				</View>
			</View>
			
			<View style={{flex:0.2}}>
				<Text style={styles.title_text}>Todo: Graph</Text>
			</View>
		</View>
    	</View>
    );
}

var modelsrc="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images";

var modelstate = 0;

function renderImage() {
	if (modelstate==0){
		var suffix = "/precip/precip_ens0.jpg";
		var newurl = modelsrc.concat(suffix);
		return(
		<Image style={styles.image} source={newurl} />
		);
	}
	else if (modelstate==1){
		var suffix = "/temp/temp_ens0.jpg";
		var newurl = modelsrc.concat(suffix);
		return(
		<Image style={styles.image} source={newurl} />
		);
	}
	else if (modelstate==2){
		var suffix = "/seaIce/ice_ens0.jpg";
		var newurl = modelsrc.concat(suffix);
		return(
		<Image style={styles.image} source={newurl} />
		);
	}
}

function EachAlone( { navigation }) {
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
				<TouchableOpacity style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_precipitation_active.png"/>
				</View>
				</TouchableOpacity>
				
				<TouchableOpacity style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_temperature_inactive.png"/>
				</View>
				</TouchableOpacity>
				
				<TouchableOpacity style={{flex:0.33}}>
				<View style={{flex:1}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_seaice_inactive.png"/>
				</View>
				</TouchableOpacity>
			</View>
			
			<View style={{flex:0.2}}>
				<Text style={{fontSize: 12}}>2. Touch the map to select a location{"\n"}3. Touch the timeline to select a starting year.{"\n"}4. Press the play button.</Text>
			</View>
			
			<View style={{flex:0.13}}>
				<TouchableOpacity onPress={() => navigation.navigate('Home')} style={{flex: 1}}>
					<View style={{flex: 1}}>
						<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/playbutton.png"/>
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
			
			<View style={{flex:0.1}}>
				<Text style={{fontSize: 12}}>TODO: Year/C02 Display</Text>
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
				{renderImage()}
			</View>
			<View style={{flex: 0.1, flexDirection: 'row'}}>
				<View style={{flex:0.33}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/precipLegend1.png" /> 
				</View>
			</View>
			
			<View style={{flex:0.2}}>
				<Text style={styles.title_text}>Todo: Graph</Text>
			</View>
		</View>
    	</View>   
     );
}

function HomeScreen({ navigation }) {
    return (

      <div style={{ backgroundImage: 'url("https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tAnom.0181.jpg")' }} className="App">
	{/* View sized to entire screen */}
	<View style={styles.container}>

		{/* Row for title text */}
		<View style={{flex: 0.2, padding: 10}}>
			<Text style={styles.title_text}> Sounding Climate </Text>
		</View>

		{/* Row for description text */}
		<View style={{flex: 0.15}}>
			<Text style={styles.desc_text}> What do changes in temperature, precipitation, and sea ice sound like... </Text>
		</View>

		{/* Row for start buttons */}
		<View style={styles.start_buttons}>
			<View style={{flex: 0.05}}></View>
			<TouchableOpacity onPress={() => navigation.navigate('EachAlone')} style={{flex: 0.4}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/btn_advBkg.png" />
				</View>
			</TouchableOpacity>
			
			<View style={{flex: 0.1}}></View>
			
			<TouchableOpacity onPress={() => navigation.navigate('AllTogether')} style={{flex: 0.4}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/btn_basicBkg.png"/>
				</View>
			</TouchableOpacity>
			<View style={{flex: 0.05}}></View>
		</View>

		{/* Row for QR code */}
		<View style={styles.info}>
			<View style={{flex: 0.35}}></View>
			<TouchableOpacity onPress={onClick} style={{flex: 0.3}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/articleqr.png"/>
				</View>
			</TouchableOpacity>
			<View style={{flex: 0.35}}></View>
		</View>
	</View>
      </div>
    );

}

const Stack = createStackNavigator();

function App() {
  return (
  <NavigationContainer>
  	<Stack.Navigator screenOptions={{headerShown: false}}  initialRouteName="Home">
  		<Stack.Screen name="Home" component={HomeScreen} />
  		<Stack.Screen name="AllTogether" component={AllTogether} />
  		<Stack.Screen name="EachAlone" component={EachAlone} />
  	</Stack.Navigator> 
  </NavigationContainer>
  );
}

export default App;
