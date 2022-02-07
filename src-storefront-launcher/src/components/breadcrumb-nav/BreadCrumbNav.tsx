import React, { PureComponent, Fragment } from 'react';
// @ts-ignore
import { connect } from 'react-redux';
import { get } from 'lodash';
import { AVAILABLE_SCREENS } from '../../constants';
import { navRequest } from '../../actions';

class BreadCrumbNav extends PureComponent<any, any> {

    componentDidMount() {
        
    }

    _navigateHome(event: any) {
        event.preventDefault();
        this.props.navRequest({
            screen: AVAILABLE_SCREENS.home
        })
    }

    _navigateToCategory(event: any, slug: any) {
        event.preventDefault();
        this.props.navRequest({
            screen: AVAILABLE_SCREENS.category,
            slug
        })
    }

    _renderAll() {
        const { breadCrumbNav, shop } = this.props;
        if (get(breadCrumbNav, 'screen') === AVAILABLE_SCREENS.home) {
            return <a className="atls-breadcrumb atls-fs" href="#" onClick={ event => event.preventDefault() }>{ get(shop, 'locales.launcherAllCollections') }</a>
        }
        return(
            <Fragment>
                <a className="atls-breadcrumb atls-breadcrumb-active atls-fs" href="#" onClick={ this._navigateHome.bind(this) }>{ get(shop, 'locales.launcherAllCollections') }</a>
                <span className="unf-keyboard_arrow_right atls-b-separator atls-fs"></span>
            </Fragment>
        )
    }

    _renderCategory() {
        const { breadCrumbNav } = this.props;
        if (get(breadCrumbNav, 'screen') === AVAILABLE_SCREENS.category) {
            return(
                <a className="atls-breadcrumb atls-fs" href="#" onClick={ event => event.preventDefault() }>
                    { get(breadCrumbNav, 'data.category.title', '') }
                </a>
            )
        }
        return(
            <Fragment>
                <a className="atls-breadcrumb atls-breadcrumb-active atls-fs" href="#" onClick={ event => this._navigateToCategory(event, get(breadCrumbNav, 'data.category.slug', '')) }>
                    {get(breadCrumbNav, 'data.category.title', '')}
                </a>
                <span className="unf-keyboard_arrow_right atls-b-separator atls-fs"></span>
            </Fragment>
        )
    }

    _renderArticle() {
        const { breadCrumbNav } = this.props;
        if (get(breadCrumbNav, 'screen') === AVAILABLE_SCREENS.article) {
            return(
                <a className="atls-breadcrumb atls-shorten" href="#" onClick={ event => event.preventDefault() }>
                    { get(breadCrumbNav, 'data.article.title', '') }
                </a>
            )
        }
        return <noscript />
    }

    render() {
        const { breadCrumbNav } = this.props;
        const isHome: boolean = get(breadCrumbNav, 'screen') === AVAILABLE_SCREENS.home;
        return(
            <div className="atlas-breadcrumb-nav">
                { this._renderAll() }
                { !isHome && this._renderCategory() }
                { !isHome && this._renderArticle() }
            </div>
        )
    }
}

const mapStateToProps = ({ breadCrumbNav, shop }: any) => {
    return { breadCrumbNav, shop };
}

export default connect(mapStateToProps, { navRequest })(BreadCrumbNav);
