import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, Image, Text } from "react-native";
import './App.css';

var styles = StyleSheet.create({
	container: {
		padding: 10,
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height
	},

	start_buttons: {
		flex: 0.35,
		flexDirection: 'row',
	},
	info: {
		flex: 0.25,
		flexDirection: 'row',
	},

	image: {
		flex: 1,
		width: '100%',
		height: '100%',
		resizeMode: 'contain'
	},

	title_text: {
		fontWeight: 'bold',
		fontSize: (Dimensions.get('window').height / 15 + Dimensions.get('window').width / 40),
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center'
	},
	desc_text: {
		fontSize: (Dimensions.get('window').height / 30 + Dimensions.get('window').width / 80),
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center'
	}
});


class App extends Component {
  componentDidMount(){
    document.title = "NCAR Sounding Climate"
  }


  render() {
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
			<View style={{flex: 0.1}}></View>
			<View style={{flex: 0.3}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/btn_advBkg.png"/>
			</View>
			<View style={{flex: 0.2}}></View>
			<View style={{flex: 0.3}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/btn_basicBkg.png"/>
			</View>
			<View style={{flex: 0.1}}></View>
		</View>

		{/* Row for QR code */}
		<View style={styles.info}>
			<View style={{flex: 0.4}}></View>
			<View style={{flex: 0.2}}>
				<Image style={styles.image} source="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/articleqr.png"/>
			</View>
			<View style={{flex: 0.4}}></View>
		</View>
	</View>
      </div>
    );
  }
}

export default App;
