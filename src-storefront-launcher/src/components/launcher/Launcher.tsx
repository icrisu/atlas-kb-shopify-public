import React, { Component } from 'react';
// @ts-ignore
import { connect } from 'react-redux';
import { isNil } from 'lodash';
import LauncherBase from './LauncherBase';
import Button from './Button';
import { navRequest } from '../../actions';
import { AVAILABLE_SCREENS } from '../../constants';

class Launcher extends Component<any, any> {

    constructor(props: any) {
        super(props);
        
        this.state = {
          active: false,
          hasTriggered: false,
        };
        
        this._handleClick = this._handleClick.bind(this);
    }

    componentDidMount() {
		try {
			this._handleEventBus();
		} catch (err) {

		}
	}

	_handleEventBus() {
		const _this = this;
		// @ts-ignore
		window._atlasExternalNavRequest = (navType, navSlug) => {
			if (navType === 'close') {
				_this.setState({ active: false });
				return;
			}
			if (navType === AVAILABLE_SCREENS.home) {
				_this.setState({ active: true });
				_this.props.navRequest({
					screen: AVAILABLE_SCREENS.home,
				})
			}
			if (navType === AVAILABLE_SCREENS.category && !isNil(navSlug) && navSlug !== '') {
				_this.setState({ active: true });
				_this.props.navRequest({
					screen: AVAILABLE_SCREENS.category,
					slug: navSlug
				})
			}
			if (navType === AVAILABLE_SCREENS.article && !isNil(navSlug) && navSlug !== '') {
				_this.setState({ active: true });
				_this.props.navRequest({
					screen: AVAILABLE_SCREENS.article,
					slug: navSlug
				})
			}
		}
	}

    _handleClick() {
      if (this.state.active === false) {
        this.props.navRequest({
          screen: AVAILABLE_SCREENS.home,
        })
      }
        this.setState({
            active: !this.state.active,
        });
    }

    render() {
        const { active } = this.state;
    
        return (
          <div className="atlas-launcher">
            {active ? <LauncherBase active={active} /> : false}
    
            <Button 
              active={active}
              onClick={this._handleClick}
            />
          </div>
        );
    }
}

export default connect(null, { navRequest })(Launcher);
