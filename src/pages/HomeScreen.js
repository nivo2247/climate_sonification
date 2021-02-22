import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ImageBackground } from "react-native";
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
	
	backgroundImage: {
		flex: 1,
		resizeMode: 'cover',
		justifyContent: 'center'
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

class HomeScreen extends React.Component {
    render(){
    
    const { navigation } = this.props;
    
    const image = { uri : "https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tAnom.0181.jpg" };
 

    return (

    <View style={styles.container}>
	<ImageBackground source={image} style={styles.backgroundImage}>

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
			<TouchableOpacity onPress={() => { navigation.navigate('EachAlone', { modelType: 0, index: 0, state: 0 }); }} style={{flex: 0.4}}>
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
	</ImageBackground>
    </View>
      
    );
    }
}



export default function(props){
    const navigation = useNavigation();

    return <HomeScreen {...props} navigation={navigation} />;
}
