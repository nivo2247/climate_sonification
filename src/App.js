import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity } from "react-native";
import * as React from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AllTogether from './pages/AllTogether.js';
import EachAlone from './pages/EachAlone.js';
import HomeScreen from './pages/HomeScreen.js';

import Axios from "axios";
const co2dburl = "http://localhost:4040/co2/getbyyear";

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

const Stack = createStackNavigator();

export default function App() {
	Axios({
			method: "GET",
			url: "http://localhost:4040/co2/getbyyear",
			headers: {
			"Content-Type": "application/json"
		}
	}).then(res => {
		console.log(res.data.data);
	});
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
