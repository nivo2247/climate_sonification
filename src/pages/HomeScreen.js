import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Page } from './Page.js';
import { isBrowser, isMobile } from 'react-device-detect';
import { eachAloneButton, allTogetherButton, qrImg } from './../const/url.js';
import './HomeScreen.css';

function redirect(){
	if(isMobile){
		window.location.href="https://news.ucar.edu/123108/40-earths-ncars-large-ensemble-reveals-staggering-climate-variability";
	}
};

class HomeScreen extends Page {

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



    return (
	<div className={'hp-container'}>

		{/* Row for title text */}
      <h1 className={'hp-title-container'}>Sounding Climate</h1>
		{/* Row for description text */}
      <p className={'hp-desc-container'}> What do changes in temperature, precipitation, and sea ice sound like... </p>

		{/* Row for start buttons */}
		<div className={'hp-btn-container'}>
    <button onClick={() => navigation.navigate('EachAlone')} className={'hpBtn'}>
			<img className={'hp-btn'} alt="each on its own" src={eachAloneButton} />
      </button>
      <button onClick={() => navigation.navigate('AllTogether')} className={'hpBtn'}>
      <img className={'hp-btn'} alt="all together" src={allTogetherButton}/></button>
		</div>

		{/* Row for qr */}
		<div className={'hp-qr-container'}>
			<a href="https://bit.ly/sounding-climate-article"><img className={'hp-qr'} alt="link to article" src={qrImg} onPointerDown={redirect} /></a>
    </div>
    <div className={'hp-link-container'}>
      <a href="https://bit.ly/sounding-climate-article">40 Earths: NCAR'S Large Ensemble Reveals Staggering Climate Variability &raquo;</a>
		</div>
    </div>

    );
    }
}



export default function HomeScreenWrapper(props){
    const navigation = useNavigation();

    return <HomeScreen {...props} navigation={navigation} />;
}
