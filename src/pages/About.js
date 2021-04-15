import { useNavigation } from '@react-navigation/native';
import { Page } from './Page.js';

class About extends Page {
	
	constructor(props){
	    super(props)
		this.state.pageBottom = 0;
		this.state.pageRight = 0;
		this.state.page = 0;
	}
	
	componentDidMount = () => {
		this.setState({ 
			pageBottom: this.props.route.params.pageBottom,
			pageRight: this.props.route.params.pageRight,
			page: this.props.route.params.page 
		});
    	}
    
    	componentWillUnmount = () => {
    		return 0;
    	}
	
	getTitleText = () => {
		if(this.state.page === 0){
			return 'Click anywhere to go back to Each Alone';
		}else{
			return 'Click anywhere to go back to All Together';
		}
	}
	
	getQ1 = () => {
		return "How do I use the lat/lon textboxes?"
	}
	
	getInfo1 = () => {
		return "Highlight the entire number before entering value into lat/lon box";
	}
	
	getInfo2 = () => {
		return "Type the number, then add the minus sign in lat/lon box";
	}
	
	getQ2 = () => {
		return "Why doesn't the crosshair go where I click?"
	}
	
	getInfo3 = () => {
		return "The crosshair for the sea ice models is slightly inaccurate. see lat/lon boxes or precip/temp models instead.";
	}
	
	getPageStyle = () => {
		const pageStyle = {
			height: this.state.pageBottom,
			width: this.state.pageRight,
			padding: this.state.PADDING / 2
		}
		return pageStyle;
	}
	
	getTextStyle = () => {
		var smallFontSize = Math.floor(this.state.pageRight / 200 + this.state.pageBottom / 100);
    		var microFontSize = smallFontSize - 2;
    		var largeFontSize = smallFontSize + 4;
    		const titleTextStyle = {
			fontSize: largeFontSize,
    			fontFamily: 'Verdana, sans-serif',
    			fontWeight: 'bold'
		}
		const questionTextStyle = {
			fontSize: smallFontSize,
    			fontFamily: 'Verdana, sans-serif',
    			fontWeight: 'bold'
		}
		const answerTextStyle = {
			fontSize: microFontSize,
    			fontFamily: 'Verdana, sans-serif'
		}
		
		return { titleTextStyle, questionTextStyle, answerTextStyle };
	}

	render(){
		const { navigation } = this.props;
		const { titleTextStyle, questionTextStyle, answerTextStyle } = this.getTextStyle();

		const pageStyle = this.getPageStyle();
		
		const titleText = this.getTitleText();
		const q1 = this.getQ1();
		const text1 = this.getInfo1();
		const text2 = this.getInfo2();
		const q2 = this.getQ2();
		const text3 = this.getInfo3();

		return(
			<div style={pageStyle} onPointerUp={() => navigation.goBack()}>
				
				<p style={titleTextStyle}>{titleText}</p> 
				<p style={questionTextStyle}><br/><br/>{q1}</p>
				<p style={answerTextStyle}><br/>{text1} <br/><br/>{text2} </p>
				<p style={questionTextStyle}><br/><br/>{q2}</p>
				<p style={answerTextStyle}><br/>{text3}</p>
				
			</div>
		)
	}
}

/*** class wrapper for naviagion functionality ***/
export default function AboutWrapper(props){
    const navigation = useNavigation();

    return <About {...props} navigation={navigation} />;
}
