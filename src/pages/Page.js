import * as React from 'react';

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
    		co2data: [0],
    		PADDING: 40
    	};
    	this.graphRef = React.createRef();
    }  
    
    /*** called when the window is resized ***/
    updateDimensions = () => {
    	var newheight = window.innerHeight;
    	var newwidth = window.innerWidth;
    	this.setState({
    		pageBottom: newheight - 1,
    		pageRight: newwidth - 1
    	});
    } 
    
    /*** Called when the window is rotated on mobile ***/
    rotateDimensions = async () => {
    	await timer(1000);
    	window.scrollTo(0, 0);
	window.resizeTo(this.state.pageBottom, this.state.pageRight);
    	window.focus();
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
