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
    	};
    }  
    
    /*** called when the window is resized ***/
    updateDimensions = () => {
    	this.setState({
    		pageBottom: window.innerHeight - PADDING,
    		pageRight: window.innerWidth - PADDING
    	});
    } 
    
    /*** Called when the window is rotated on mobile ***/
    rotateDimensions = async () => {
    	await timer(1000);
    	this.updateDimensions();
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
