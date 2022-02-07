import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
// @ts-ignore
import FadeIn from 'react-fade-in';
import { get, isNil } from 'lodash';
// @ts-ignore
import { connect } from 'react-redux';
import { getCategories } from '../../actions';
import BreadCrumbNav from '../../components/breadcrumb-nav/BreadCrumbNav';
import SocialLinks from '../../components/social/SocialLinks';
import { AVAILABLE_SCREENS } from '../../constants';
import Categories from '../pages/Categories';
import Category from '../pages/Category';
import Article from '../pages/Article';

const presets = {
    default: { stiffness: 330, damping: 20 },
};

class LauncherBase extends Component<any, any> {

	static defaultProps = {
        shop: {}
    }

    constructor(props: any) {
        super(props);
        
        this.state = {
          height: 670,
		  stable: false,
        }
        
        this._handleRest = this._handleRest.bind(this);
      }

      componentDidMount() {
        const height = get(window, 'innerHeight', 600);
        
        this.setState({
          height: height - (height * 0.2),
        });
      }
      
      componentWillUnmount() {
        this.setState({
          stable: false,
        });
      }
    
      _handleRest() {
        this.setState({
          stable: true,
        });
	  }

	render() {
		const { active, shop } = this.props;
		let { navEvents } = this.props;
		if (isNil(navEvents)) {
			navEvents = {
				screen: AVAILABLE_SCREENS.home
			}
		}

		return (
			<Motion
			defaultStyle={{
				y: 20,
				opacity: 0,
			}}
			style={{
				y: spring(active ? 0 : 20, presets.default),
				opacity: spring(active ? 1 : 0, presets.default),
			}}
			onRest={this._handleRest}
			>
			{interpolatingStyles=>
				<div 
				className="atlas-launcher-base"
				style={{
					height: this.state.height,
					opacity: interpolatingStyles.opacity,
					transform: `translateY(${interpolatingStyles.y}px)`
				}}
				>
				<div className="atlas-launcher-header">
					<h2 className="atls-launcher-title">{get(shop, 'locales.launcherTitle', '')}</h2>
					<SocialLinks shop={shop} />
				</div>
				<div className="atlas-launcher-content">
					<div className="atlas-launcher-content-inner">
						<div className="atlas-nav">
							<BreadCrumbNav />
						</div>
						<div id="atls-scroll-container" className="atlas-page-content atls-scroll">
							{ active && navEvents.screen === AVAILABLE_SCREENS.home && <FadeIn><Categories /></FadeIn> }
							{ active && navEvents.screen === AVAILABLE_SCREENS.category && <FadeIn><Category slug={get(navEvents, 'slug', '')} /></FadeIn> }
							{ active && navEvents.screen === AVAILABLE_SCREENS.article && <FadeIn><Article slug={get(navEvents, 'slug', '')} /></FadeIn> }
						</div>
					</div>
				</div>
				</div>
			}
			</Motion>
		);
	}
}

const mapStateToProps = ({ shop, navEvents }: any) => {
    return { shop, navEvents };
}

export default connect(mapStateToProps, { getCategories })(LauncherBase);


