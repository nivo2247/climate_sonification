import * as React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Page } from './Page.js';

//TODO: Declare URLS as consts

//TODO: Rename function to make sense
function onClick(){
	window.location.href="https://news.ucar.edu/123108/40-earths-ncars-large-ensemble-reveals-staggering-climate-variability";
};

class HomeScreen extends Page {
    constructor(props){
    	super(props)
    }  
    
    //TODO: Add text styles
    getStyles(){
    	const containerStyle = {
    		height: Math.floor(this.state.pageBottom),
    		width: Math.floor(this.state.pageRight),
    		backgroundImage: 'url("https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tAnom.0181.jpg")'
    	};
    	const titleDivStyle = {
    		height: this.state.pageBottom / 5,
    		width: this.state.pageRight,
    		overflow: 'hidden',
    		float: 'left'
    	};
    	const descDivStyle = {
    		height: this.state.pageBottom * 3 / 20,
    		width: this.state.pageRight,
    		overflow: 'hidden',
    		float: 'left'
    	};
    	const buttonDivStyle = {
    		height: Math.floor(this.state.pageBottom * 7 / 20),
    		width: Math.floor(this.state.pageRight),
    		overflow: 'hidden',
    		float: 'left'
    	};
    	const qrDivStyle = {
    		height: this.state.pageBottom * 6 / 20,
    		width: this.state.pageRight,
    		overflow: 'hidden'
    	};
    	const buttonBumperStyle = {
    		height: Math.floor(this.state.pageBottom * 7 / 20),
    		width: Math.floor(this.state.pageRight / 20),
    		float: 'left'
    	};
    	const buttonStyle = {
    		height: Math.floor(this.state.pageBottom * 7 / 20),
    		width: Math.floor(this.state.pageRight * 2 / 5),
    		overflow: 'hidden',
    		float: 'left'
	};
	const qrBumperStyle = {
		height: Math.floor(this.state.pageBottom * 6 / 20),
		width: Math.floor(this.state.pageRight * 6 / 20),
		float: 'left'
	};
	const qrStyle = {
		height: Math.floor(this.state.pageBottom * 6 / 20),
		width: Math.floor(this.state.pageRight * 8 / 20),
		float: 'left'
	};
    	
    	return { containerStyle, titleDivStyle, descDivStyle, buttonDivStyle, qrDivStyle, buttonBumperStyle, buttonStyle, qrBumperStyle, qrStyle };
    }
    
    /*** runs on page open ***/
    componentDidMount = () => {
    	window.addEventListener('resize', this.updateDimensions);
    	window.addEventListener('orientationchange', this.rotateDimensions);
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	window.removeEventListener('resize', this.updateDimensions);
    	window.removeEventListener('orientationchange', this.rotateDimensions);
    }
    
    render(){
    
    const { navigation } = this.props;
    
    const { containerStyle, titleDivStyle, descDivStyle, buttonDivStyle, qrDivStyle, buttonBumperStyle, buttonStyle, qrBumperStyle, qrStyle } = this.getStyles();

    return (

	<div style={containerStyle}>

		{/* Row for title text */}
		<div style={titleDivStyle}>
			<h1>Sounding Climate</h1>
		</div>

		{/* Row for description text */}
		<div style={descDivStyle}>
			<h2> What do changes in temperature, precipitation, and sea ice sound like... </h2>
		</div>

		{/* Row for start buttons */}
		<div style={buttonDivStyle}>
			<div style={buttonBumperStyle}/>
			
			<div style={buttonStyle} onPointerUp={() => navigation.navigate('EachAlone')}>
				<img style={buttonStyle} src="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/btn_advBkg.png" />
			</div>
			
			<div style={buttonBumperStyle}/>
			<div style={buttonBumperStyle}/>
			
			<div style={buttonStyle} onPointerUp={() => navigation.navigate('AllTogether')}>
				<img style={buttonStyle} src="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/btn_basicBkg.png" />
			</div>
			
			<div style={buttonBumperStyle}/>
		</div>
		
		<div style={qrDivStyle}>
			<div style={qrBumperStyle}/>
			<div style={qrStyle} onPointerUp={this.onClick}>
				<img style={qrStyle} src="https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/articleqr.png"/>
			</div>
			<div style={qrBumperStyle}/>
		</div>

    </div>
      
    );
    }
}



export default function(props){
    const navigation = useNavigation();

    return <HomeScreen {...props} navigation={navigation} />;
}
