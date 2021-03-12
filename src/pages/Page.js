import * as React from 'react';

export const PADDING = 1;

const timer = ms => new Promise(res => setTimeout(res, ms));

/*** Shared class for EachAlone and AllTogether class ***/
export class Page extends React.Component {
    constructor(props){
    super(props)
        this.state = {
    		pageBottom: window.innerHeight,
    		pageRight: window.innerWidth,
    		pageBottomMax: window.innerHeight,
    		pageRightMax: window.innerWidth,
    	};
    }  
    
    /*** called when the window is resized ***/
    updateDimensions = () => {
    	var newheight = window.innerHeight;
    	var newwidth = window.innerWidth;
    	this.setState({
    		pageBottom: newheight - PADDING,
    		pageRight: newwidth - PADDING
    	});
    } 
    
    /*** Called when the window is rotated on mobile ***/
    rotateDimensions = async () => {
    	await timer(1000);
	window.resizeTo(this.state.pageRightMax, this.state.pageBottomMax);
    	this.setState({
    		pageBottom: window.innerHeight,
    		pageRight: window.innerWidth
    	});
    }
          
    /*** These should never run because each class has separate functions,
    *** but these are here to keep react from complaining ***/
    componentDidMount = () => {
    	console.log("cdm class fail");
    }
    
    componentWillUnmount = () => {
    	console.log("cdu class fail");
    }

    render(){
    	return(<p>Class Failed to load Properly</p>);
    }
}
