import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity } from "react-native";
import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const styles = StyleSheet.create({
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

class AllTogether extends React.Component {    
    render(){
    
    var year = 1920;
    var co2val = 390;
    
    const { navigation } = this.props;
    
    return (
    	<View style={styles.rcontainer}>
    		<View style={{flex:0.2}}>
    			<TouchableOpacity onPress={ () => navigation.navigate('Home') } style={{flex: 0.1}}>
				<View style={{flex: 1}}>
					<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/UCAR_btn_home_active.png"/>
				</View>
			</TouchableOpacity>
			
			<View style={{flex:0.2}}>
				<Text style={{fontWeight: 'bold', fontSize: 14}}>Instructions</Text>
				<Text style={{fontSize: 12}}>1. Touch the map to select a location{"\n"}2. Touch the timeline to select a starting year.{"\n"}3. Press the play button.</Text>
			</View>
			
			<View style={{flex:0.13}}>
				<TouchableOpacity style={{flex: 1}}>
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
			
			<View style={{flex:0.1, flexDirection: 'row'}}>
				<View style={{flex:0.5}}>
				<Text style={{fontSize: 12}}>Year{"\n"}{year}</Text>
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
}


export default function(props){
    const navigation = useNavigation();

    return <AllTogether {...props} navigation={navigation} />;
}
