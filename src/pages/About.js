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
			return 'About Sounding Climate';
	}

  getRtnBtnText = () => {
    if(this.state.page === 0){
      return 'Close About';
    }else{
      return 'Close About';
    }
  }


getAboutText = () => {
  return  (
    <div className="about">
    <p><strong><em>Sounding Climate</em></strong> lets you explore how precipitation, temperature, and sea ice change over time through  data represented in graphs, maps, and sonifications.  Select a location on the map, and experience, through sight and sound, how climate varies over time.</p>
    <ul>
    <li>
    <strong>Sonification:</strong> Each data value is assigned a particular pitch, and each variable is played by a different instrument (synthesized tones representing marimba for precipitation, clarinet for temperature, and violins for sea ice). Carbon dioxide levels control the musical scale of the pitches assigned to the data values. </li><li>
    <strong>Maps:</strong> Each map shows a different rendition of natural climate variability, superimposed upon a common human influence. By sliding their cursor over the color bar beneath each map, you can  see and hear how the data values are mapped to color and pitch. You can also hear geographical patterns in the data by sliding the cursor directly over the maps. </li><li>
    <strong>About the data:</strong> The temperature values are based on annual means and expressed in degrees Celsius change relative to a 1920-1950 baseline; the precipitation values are also based on annual means and expressed as a percentage change relative to a 1920-1950 baseline; and the sea ice fraction values are for the month of September and expressed as the percentage of sea ice present in each grid cell.
    </li></ul>
    </div>
  );

}

getInfographic = () => {
  return (
      <div className="infographic">
      <img src="/tutorial.png" alt="Infographic describing how to use the Sounding Climate interface" longdesc="/infographic-longdesc.txt" /><br/>

      </div>
  );
}

getGuidingQuestions = () => {
    return (
        <div className="guidingQuestions">
        <h2>Questions to Guide Your Exploration</h2>
        <p className="question">What does the climate in my hometown sound like? </p>
        <ul className="answer">
          <li>Enter the latitude and longitude of your hometown and click “go” to hear climate change.</li>
          <li>Or, choose the nearest location from the dropdown list and click “go” to hear climate change.</li>
        </ul>

        <p className="question">Where in the world is climate changing the most? </p>
        <ul className="answer">
          <li>Click “play” and watch the maps to find where the colors are changing the most. Does the place with the most temperature change also have the most precipitation change? </li>
        </ul>

        <p className="question">What does natural variation in climate sound like? How does human influence change the sound? </p>
        <ul className="answer">
          <li>Click play and listen while watching the graph at the bottom of the screen. How are the thin lines on the graph trending? </li>
        </ul>

        <p className="question">Do you hear the change in the sound when our human impact on climate change is the main force driving climate change?</p>
        <ul className="answer">
          <li>That’s when the greenhouse gases we are adding to the atmosphere get to the point where they are more powerful than all other influences. </li>
        </ul>

        <p className="question">Close your eyes and listen. How does the sound of climate change make you feel? </p>

        <p className="question">When, on the timeline, does Arctic sea ice dwindle to nothing? Does it change gradually or abruptly?</p>
        <ul className="answer">
          <li>The data in Sounding Climate shows the amount of Arctic sea ice at the end of each summer, which is the time of year when sea ice is at its lowest amount. </li>
        </ul>
        </div>
    );
}

  getBackground = () => {
    return (
      <div className="background">
      <h2> How We Made Sounding Climate</h2>
      <p>Sounding Climate began as a collaboration between climate scientist, Dr. Clara Deser (at the National Center for Atmospheric Research - NCAR) and sound designer and data artist, Marty Quinn (founder of the Design Rhythmics Sonification Research Laboratory). A version of Sounding Climate was created for the exhibits at the NCAR Mesa Lab in Boulder, Colorado, by the team at the UCAR Center for Science Education. Then, this web-based version of Sounding Climate was developed by engineering students at the University of Colorado, Boulder. </p><p>The sonification and visualizations in Sounding Climate are based on data from one of the world’s most comprehensive numerical models of the Earth’s climate system, NCAR Community Earth System Model version 1 (CESM1). This model simulates past and future climate from 1920-2100, assuming a “business-as-usual” scenario for rising concentrations of carbon dioxide and other greenhouse gases due to the burning of fossil fuels. In addition to human influences on climate, the model also includes natural sources of climate variability in the oceans, atmosphere, land and sea ice, such as those that produce El Niño events or multi-decadal changes in the Atlantic Ocean’s overturning circulation. By repeating the model experiments many times, changing only the initial atmospheric temperature state by a miniscule amount , scientists are able to untangle human and natural influences on climate.  Each experiment contains its own unique sequence of natural variability, which cannot be predicted more than a few years in advance, superimposed upon a common signal of human-caused climate change. The human influence at any given time and location is isolated by averaging all of the 40 experiments together. </p>
      </div>
    );
  }

  getLearnMore = () => {
    return  (
      <div className="learnmore">
      <h2>Learn More</h2>
      <ul className="linklist">
        <li><a href="https://scied.ucar.edu/learning-zone/how-climate-works">How Climate Works</a></li>
        <li><a href="https://scied.ucar.edu/learning-zone/climate-change-impacts">Impacts of Climate Change</a></li>
        <li><a href="https://scied.ucar.edu/learning-zone/climate-solutions">Solving Climate Change</a></li>
        <li><a href="https://news.ucar.edu/123108/40-earths-ncars-large-ensemble-reveals-staggering-climate-variability">NCAR article describing the CESM1 model experiments</a></li>
        <li><a href="https://www.ipcc.ch/">United Nations Intergovernmental Panel on Climate Change</a> uses the data from these experiments in reports.</li>
      </ul>
      </div>
    );
  }




	render(){
		const { navigation } = this.props;


		const titleText = this.getTitleText();
    const rtnBtn = this.getRtnBtnText();
    const infographic = this.getInfographic();
    const aboutText = this.getAboutText();
    const guidingQuestions = this.getGuidingQuestions();
    const background = this.getBackground();
    const learnMore = this.getLearnMore();

		return(
			<div className="aboutPage">
				<h1>{titleText}</h1>
        {aboutText}
        {infographic}
        {guidingQuestions}
        {background}
        {learnMore}
        <button className="closeAbout" onClick={() => navigation.goBack()}>{rtnBtn}</button>
			</div>
		)
	}
}

/*** className wrapper for naviagion functionality ***/
export default function AboutWrapper(props){
    const navigation = useNavigation();

    return <About {...props} navigation={navigation} />;
}
