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
	
	getInfo1 = () => {
		return "Highlight the entire number before entering value into lat/lon box";
	}
	
	getInfo2 = () => {
		return "Type the number, then add the minus sign in lat/lon box";
	}
	
	getInfo3 = () => {
		return "The crosshair for the sea ice models is slightly inaccurate. see lat/lon boxes instead.";
	}
	
	getPageStyle = () => {
		const pageStyle = {
			height: this.state.pageBottom,
			width: this.state.pageRight,
			padding: this.state.PADDING / 2
		}
		return pageStyle;
	}

	render(){
		const { navigation } = this.props;

		const pageStyle = this.getPageStyle();
		
		const titleText = this.getTitleText();
		const text1 = this.getInfo1();
		const text2 = this.getInfo2();
		const text3 = this.getInfo3();

		return(
			<div style={pageStyle} onPointerUp={() => navigation.goBack()}>
				
				<p>{titleText}</p> 
				<p><br/><br/>{text1} <br/><br/>{text2} <br/><br/>{text3}</p>
				
			</div>
		)
	}
}

/*** class wrapper for naviagion functionality ***/
export default function AboutWrapper(props){
    const navigation = useNavigation();

    return <About {...props} navigation={navigation} />;
}
