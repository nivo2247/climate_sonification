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

  getRtnBtnText = () => {
    if(this.state.page === 0){
      return 'Close FAQ';
    }else{
      return 'Close FAQ';
    }
  }
	getQ0 = () => {
		return "Sound issues or waiting for data?"
	}

	getInfo0 = () => {
		return "If there are any issues, refresh the page and start over. This generally happens when points are selected too quickly."
	}

	getQ1 = () => {
		return "How do I use the lat/lon textboxes?"
	}

	getInfo1_1 = () => {
		return "Highlight the entire number before entering value into lat/lon box";
	}

	getInfo1_2 = () => {
		return "Type the number, then add the minus sign in lat/lon box";
	}

	getQ2 = () => {
		return "Why doesn't the crosshair go where I click?"
	}

	getInfo2 = () => {
		return "The crosshair for the sea ice models is slightly inaccurate. see lat/lon boxes or precip/temp models instead.";
	}

	getQ3 = () => {
		return "More info:"
	}

	getInfo3_1 = () => {
	return "Sounding Climate is the result of a collaboration between climate scientist, Dr. Clara Deser from the National Center for Atmospheric Research (NCAR), and sound designer and data artist, Marty Quinn (founder of the Design Rhythmics Sonification Research Laboratory).  The sonification and visualizations in Sounding Climate are based on data from one of the world’s most comprehensive numerical models of the earth’s climate system, NCAR Community Earth System Model version 1 (CESM1). This model simulates past and future climate from 1920-2100, assuming a “business-as-usual” scenario for rising concentrations of carbon dioxide and other greenhouse gases due to the burning of fossil fuels. In addition to human influences on climate, the model also includes natural sources of climate variability in the oceans, atmosphere, land and sea ice, such as those that produce El Nino events or multi-decadal changes in the Atlantic Ocean’s overturning circulation. By repeating the model experiments many times, changing only the initial atmospheric temperature state by a miniscule amount (about 10 -14 K), scientists are able to untangle human and natural influences on climate. Each experiment contains its own unique sequence of natural variability, which cannot be predicted more than a few years in advance, superimposed upon a common signal of human-caused climate change. The human influence at any given time and location is isolated by averaging all of the 40 experiments together. A non-technical description of the model experiments is available via the QR code on the homepage. The data from these experiments have been used in the Assessment Reports of the United Nations Intergovernmental Panel on Climate Change.";
	}

	getInfo3_2 = () => {
	return "Sounding Climate visitors explore how precipitation, temperature, and sea ice change over time through interactive visual graphs and sound “maps” (called sonifications). Just like colors on a map, each data value is assigned particular pitch, and each variable is played by a different instrument (marimba for precipitation, woodwind instruments for temperature, and violins for sea ice). Carbon dioxide levels are played by a piano, and also control the musical scale of the pitches assigned to the data values. By selecting a location on the map, visitors experience through sight and sound how climate varies over time. Each map shows a different rendition of natural climate variability, superimposed upon a common human influence. By sliding their cursor over the color bar located beneath each world map, visitors can simultaneously see and hear how the data values are mapped to color and pitch. Visitors can also hear geographical patterns in the data by sliding their cursor directly over the maps. The temperature values are based on annual means and expressed in degrees Celsius change relative to a 1920- 1950 baseline; the precipitation values are also based on annual means and expressed as a percentage change relative to a 1920-1950 baseline; and the sea ice fraction values are for the month of September and expressed as the percentage of sea ice present in each grid cell.";
	}

	getInfo3_3 = () => {
	return "There are two ways to explore the data in Sounding Climate: 1) “Each on Its Own” and 2) “All Together”. If you select the first option, you will see 6 maps (one for each of the first 6 model experiments) for the variable you choose (precipitation, temperature, and sea ice). Each of these maps shows a different combination of natural and human influences on climate as explained above. The graph below the maps will show two thin curves and one thick curve. The thin curves show the data values for the first 2 model experiments, and the thick curve shows the data values for the average of all 40 model experiments (the human influence on climate, as explained above) for the location you chose. The yellow curve shows the global average carbon dioxide levels. The sonifications use the data from all 4 curves. Notice how the blend of musical notes changes as the climate is altered by human activity. If you select the second option, you will see a different set of maps: the top row shows the human influence on climate for each of the 3 variables, and the bottom row shows the combined human and natural influences from the first model experiment. Notice how the maps in the two rows may look very different at the beginning but become more similar as the human influence starts to dominate. The graphs below the maps show the data values at the location you chose. The thick curve shows the human influence and the thin curve shows the combined human and natural influence in the first model experiment, corresponding to the maps above it. Precipitation is in green, temperature in red, and sea ice in light blue; the The yellow curve shows the global average carbon dioxide levels. The sonifications use the data from all 4 curves.";
	}

	getInfo3_4 = () => {
	return "Contributors to the project: Adam S. Phillips (NCAR) for providing the model data, Timothy Scheitlin (NCAR) for providing the graphics, Sharon Clark for providing ongoing development support, Becca Hatheway for providing user testing and feedback, Marty Quinn for the original sonification development, and Clara Deser for scientific and artistic guidance. This website was developed by Nick Vomund, with the original API written by Garrett Hempy, sonification by Mattias Leino, and support by Priyanka Karki, Fahad Shaik, and Zhaoyi Xie.";
	}

	getPageStyle = () => {
		const pageStyle = {
			height: '100%',
			width: this.state.pageRight,
			padding: this.state.PADDING / 2,
      backgroundColor: 'white'
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
    			fontWeight: 'bold',
    			'backgroundColor': '#DDDDDD',
    			'padding': smallFontSize,
    			'borderRadius': smallFontSize
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
    const rtnBtn = this.getRtnBtnText();
		const q0 = this.getQ0();
		const text0 = this.getInfo0();
		const q1 = this.getQ1();
		const text1_1 = this.getInfo1_1();
		const text1_2 = this.getInfo1_2();
		const q2 = this.getQ2();
		const text2 = this.getInfo2();
		const q3 = this.getQ3();
		const text3_1 = this.getInfo3_1();
		const text3_2 = this.getInfo3_2();
		const text3_3 = this.getInfo3_3();
		const text3_4 = this.getInfo3_4();

		return(
			<div style={pageStyle}>

				<p style={titleTextStyle}>{titleText}</p>
				<p style={questionTextStyle}><br/><br/>{q0}</p>
				<p style={answerTextStyle}><br/>{text0} </p>
				<p style={questionTextStyle}><br/><br/>{q1}</p>
				<p style={answerTextStyle}><br/>{text1_1} <br/><br/>{text1_2} </p>
				<p style={questionTextStyle}><br/><br/>{q2}</p>
				<p style={answerTextStyle}><br/>{text2}</p>
				<p style={questionTextStyle}><br/><br/>{q3}</p>
				<p style={answerTextStyle}><br/>{text3_1}</p>
				<p style={answerTextStyle}><br/>{text3_2}</p>
				<p style={answerTextStyle}><br/>{text3_3}</p>
				<p style={answerTextStyle}><br/>{text3_4}<br/><br/></p>
        <button onClick={() => navigation.goBack()}>{rtnBtn}</button>
			</div>
		)
	}
}

/*** class wrapper for naviagion functionality ***/
export default function AboutWrapper(props){
    const navigation = useNavigation();

    return <About {...props} navigation={navigation} />;
}
