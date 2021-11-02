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
  		<Stack.Screen name="Home" component={HomeScreenWrapper} options={{ title: 'Home | Sounding Climate' }} />
  		<Stack.Screen name="AllTogether" component={AllTogetherWrapper}  options={{ title: 'All Together | Sounding Climate' }} />
  		<Stack.Screen name="EachAlone" component={EachAloneWrapper}  options={{ title: 'Each on its own | Sounding Climate' }} />
  		<Stack.Screen name="About" component={AboutWrapper}  options={{ title: 'About | Sounding Climate' }} />
  	</Stack.Navigator>
  </NavigationContainer>
  );
}
