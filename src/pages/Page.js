import { Dimensions, Image } from "react-native";
import * as React from 'react';

export const PADDING = 5;

const timer = ms => new Promise(res => setTimeout(res, ms));

/*** Shared class for EachAlone and AllTogether class ***/
export class Page extends React.Component {
    constructor(props){
    super(props)
        this.state = {
    		pageBottom: Dimensions.get('window').height - PADDING,
    		pageRight: Dimensions.get('window').width - PADDING,
    	};
    }  
    
    /*** called when the window is resized ***/
    updateDimensions = () => {
    	if(Dimensions.get('window').height < Dimensions.get('window').width){
    		this.setState({
    			pageBottom: Dimensions.get('window').height - PADDING,
    			pageRight: Dimensions.get('window').width - PADDING,
    			CONTROLDIV: 2 / 10,
			SKINNYDIV: 1 / 20,
			MAPDIV: 3 / 4,
			MAPVERTDIV: 3 / 4,
			GRAPHVERTDIV: 2 / 10,
			SLIDERVERTDIV: 1 / 20,
			CONTROLDIVFLOAT: 'left',
			MAPDIVFLOAD: 'right',
			CONTROLVERTDIV: 1,
			CONTROLSPLIT: 1
    		});
    	}
    	else{
    		this.setState({
    			pageBottom: Dimensions.get('window').height - PADDING,
    			pageRight: Dimensions.get('window').width - PADDING,
    			CONTROLDIV: 1,
			SKINNYDIV: 1 / 20,
			MAPDIV: 19 / 20,
			MAPVERTDIV: 1 / 4,
			GRAPHVERTDIV: 1 / 5,
			SLIDERVERTDIV: 1 / 20,
			CONTROLDIVFLOAT: 'right',
			MAPDIVFLOAT: 'left',
			CONTROLVERTDIV: 1 / 2,
			CONTROLSPLIT: 1 / 2
    		});
    	}	
    	this.setupGraph();
    } 
    
    /*** Called when the window is rotated on mobile ***/
    rotateDimensions = async () => {
    	await timer(1000);
    	this.updateDimensions();
    }
          
    /*** These should never run because each class has separate functions,
    *** but these are here to keep react from complaining ***/
    componentDidMount = () => {
    	console.log("class fail");
    }
    
    componentWillUnmount = () => {
    	console.log("class fail");
    }

    render(){
    	return(<p>Class Failed to load Properly</p>);
    }
}
