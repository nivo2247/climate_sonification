import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Page } from './Page.js';
import { isBrowser, isMobile } from 'react-device-detect';
import { eachAloneButton, allTogetherButton, qrImg } from './../const/url.js';

function redirect(){
	if(isMobile){
		window.location.href="https://news.ucar.edu/123108/40-earths-ncars-large-ensemble-reveals-staggering-climate-variability";
	}
};

class HomeScreen extends Page { 
    
    getStyles(){
    	var titleTextSize = Math.floor(this.state.pageRight / 30 + this.state.pageBottom / 30);
    	var descTextSize = Math.floor(titleTextSize / 2);
    
    	const containerStyle = {
    		height: Math.floor(this.state.pageBottom),
    		width: Math.floor(this.state.pageRight),
    		backgroundImage: 'url("https://soundingclimate-media.s3.us-east-2.amazonaws.com/images/interface/tAnom.0181.jpg")',
    		overflow: 'hidden'
    	};
    	const bumperDivStyle = {
    		height: this.state.pageBottom * 1 / 20,
    		width: this.state.pageRight,
    		overflow: 'hidden',
    		float: 'left'
    	};
    	const titleDivStyle = {
    		height: this.state.pageBottom * 3 / 20,
    		width: this.state.pageRight,
    		float: 'left',
    		'textAlign': 'center'
    	};
    	const descDivStyle = {
    		height: this.state.pageBottom * 3 / 20,
    		width: this.state.pageRight,
    		overflow: 'hidden',
    		float: 'left',
    		'textAlign': 'center'
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
    	var buttonBumperStyle = {
    		height: Math.floor(this.state.pageBottom * 7 / 20),
    		width: Math.floor(this.state.pageRight / 20),
    		float: 'left'
    	};
    	var buttonStyle = {
    		height: Math.floor(this.state.pageBottom * 7 / 20),
    		width: Math.floor(this.state.pageRight * 2 / 5),
    		overflow: 'hidden',
    		float: 'left'
	};
	var qrBumperStyle = {
		height: Math.floor(this.state.pageBottom * 6 / 20),
		width: Math.floor(this.state.pageRight * 17 / 40),
		float: 'left'
	};
	var qrStyle = {
		height: Math.floor(this.state.pageBottom * 5 / 20),
		width: Math.floor(this.state.pageRight * 3 / 20),
		float: 'left'
	};
	
	if(this.state.pageBottom > this.state.pageRight){
		buttonBumperStyle = {
    			height: Math.floor(this.state.pageBottom * 7 / 20),
    			width: Math.floor(this.state.pageRight / 20),
    			float: 'left'
    		};
    		buttonStyle = {
    			height: Math.floor(this.state.pageBottom * 4 / 20),
    			width: Math.floor(this.state.pageRight * 2 / 5),
    			overflow: 'hidden',
    			float: 'left'
		};
		qrBumperStyle = {
			height: Math.floor(this.state.pageBottom * 6 / 20),
			width: Math.floor(this.state.pageRight * 6 / 20),
			float: 'left'
		};
		qrStyle = {
			height: Math.floor(this.state.pageBottom * 6 / 20),
			width: Math.floor(this.state.pageRight * 8 / 20),
			float: 'left'
		};
	}
	
	const titleTextStyle = {
		'fontFamily': 'Verdana, sans-serif',
		'fontSize': titleTextSize,
		'fontWeight': 'bold',
		'color':'white',
		'WebkitTextStrokeWidth': '1px',
		'WebkitTextStrokeColor': 'black',
		'display': 'inline'
	}
	const descTextStyle = {
		'fontFamily': 'Verdana, sans-serif',
		'fontSize': descTextSize,
		'fontWeight': 'bold',
		'color':'white',
		'WebkitTextStrokeWidth': '1px',
		'WebkitTextStrokeColor': '#333333',
		'display': 'inline'
	}
    	
    	return { containerStyle, bumperDivStyle, titleDivStyle, descDivStyle, buttonDivStyle, qrDivStyle, buttonBumperStyle, buttonStyle, qrBumperStyle, qrStyle, titleTextStyle, descTextStyle };
    }
    
    /*** runs on page open ***/
    componentDidMount = () => {
    	if(isBrowser){
    		window.addEventListener('resize', this.updateDimensions);
    	}
    	window.addEventListener('orientationchange', this.rotateDimensions);
    	this.setState({
    		pageBottomMax: window.innerHeight,
    		pageRightMax: window.innerWidth
    	});
    	this.updateDimensions();
    }
    
    /*** runs on page close ***/
    componentWillUnmount = () => {
    	if(isBrowser){
    		window.removeEventListener('resize', this.updateDimensions);
    	}
    	window.removeEventListener('orientationchange', this.rotateDimensions);
    }
    
    /*** return html ***/
    render(){
    
    const { navigation } = this.props;
    
    const { containerStyle, bumperDivStyle, titleDivStyle, descDivStyle, buttonDivStyle, qrDivStyle, buttonBumperStyle, buttonStyle, qrBumperStyle, qrStyle, titleTextStyle, descTextStyle } = this.getStyles();

    return (
	<div style={containerStyle}>
		<div style={bumperDivStyle}/>

		{/* Row for title text */}
		<div style={titleDivStyle}>
			<p style={titleTextStyle}>Sounding Climate</p>
		</div>

		{/* Row for description text */}
		<div style={descDivStyle}>
			<p style={descTextStyle}> What do changes in temperature, precipitation, and sea ice sound like... </p>
		</div>

		{/* Row for start buttons */}
		<div style={buttonDivStyle}>
			<div style={buttonBumperStyle}/>
			
			<div style={buttonStyle} onPointerUp={() => navigation.navigate('EachAlone')}>
				<img style={buttonStyle} alt="each on its own" src={eachAloneButton} />
			</div>
			
			<div style={buttonBumperStyle}/>
			<div style={buttonBumperStyle}/>
			
			<div style={buttonStyle} onPointerUp={() => navigation.navigate('AllTogether')}>
				<img style={buttonStyle} alt="all together" src={allTogetherButton} />
			</div>
			
			<div style={buttonBumperStyle}/>
		</div>
		
		<div style={qrDivStyle}>
			<div style={qrBumperStyle}/>
			<div style={qrStyle} onPointerDown={redirect}>
				<img style={qrStyle} alt="link to article" src={qrImg}/>
			</div>
			<div style={qrBumperStyle}/>
		</div>
    </div>
      
    );
    }
}



export default function HomeScreenWrapper(props){
    const navigation = useNavigation();

    return <HomeScreen {...props} navigation={navigation} />;
}
