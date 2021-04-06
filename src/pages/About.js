import { useNavigation } from '@react-navigation/native';
import { Page } from './Page.js';

class About extends Page {
	

	render(){
		const { navigation } = this.props;
		const nameOfPage = this.props.route.params.page;
		return(
			<div onPointerUp={() => navigation.goBack()}>
				<p>Click anywhere to go back to {nameOfPage}</p>
			</div>
		)
	}
}

/*** class wrapper for naviagion functionality ***/
export default function AboutWrapper(props){
    const navigation = useNavigation();

    return <About {...props} navigation={navigation} />;
}
