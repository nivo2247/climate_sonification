import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AllTogetherWrapper from './pages/AllTogether.js';
import EachAloneWrapper from './pages/EachAlone.js';
import HomeScreenWrapper from './pages/HomeScreen.js';
import AboutWrapper from './pages/About.js';

const Stack = createStackNavigator();

//TODO: Look into useFocusEffect from navigation/native

export default function App() {
  return (
  <NavigationContainer>
  	<Stack.Navigator screenOptions={{headerShown: false}}  initialRouteName="Home">
  		<Stack.Screen name="Home" component={HomeScreenWrapper} />
  		<Stack.Screen name="AllTogether" component={AllTogetherWrapper} />
  		<Stack.Screen name="EachAlone" component={EachAloneWrapper} />
  		<Stack.Screen name="About" component={AboutWrapper} />
  	</Stack.Navigator> 
  </NavigationContainer>
  );
}
