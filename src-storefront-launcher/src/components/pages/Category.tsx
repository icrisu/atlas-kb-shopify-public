import React, { PureComponent, Fragment } from 'react';
// @ts-ignore
import { connect } from 'react-redux';
import { get, isNil, isEmpty } from 'lodash';
import { getCategory, navRequest } from '../../actions';
import Preloader from '../../components/preloader';
import { AVAILABLE_SCREENS } from '../../constants';

class Category extends PureComponent<any, any> {

    componentDidMount() {
        try {
            // @ts-ignore
            document.getElementById('atls-scroll').scrollTop = 0
        } catch (err) {}
        const { slug } = this.props;
        this.props.getCategory(slug);
    }

    _onArticleClick(event: any, slug: string) {
        event.preventDefault();
        this.props.navRequest({
            screen: AVAILABLE_SCREENS.article,
            slug
        })
    }

    _renderArticles() {
        const articles: any[] = get(this.props, 'category.articles', []);
        let c = 0;
        return articles.map(article => {
            const catCls: string = c === articles.length - 1 ? `atlas-category atls-article-link` : `atlas-category atls-category-border atls-article-link`;
            c++;
            return(
                <div key={`k-${c}`} className={catCls} onClick={ (event) => this._onArticleClick(event, get(article, 'slug', '')) }>
                    <div className="a-cat-about">
                        <div className="a-cat-title">{ get(article, 'title', '') }</div>
                        <div className="a-cat-info">{ get(article, 'shortDescription', '') }</div>
                    </div>
                </div>
            )
        })
    }


    render() {
        const { category } = this.props;
        const showPreloader: boolean = isEmpty(category) || isNil(category);
        const categoryColor: string = get(category, 'categoryColor') && get(category, 'categoryColor') !== '' ? get(category, 'categoryColor') : '#3d4246';
        const hasCustomImage: boolean = !isNil(get(category, 'customIcon', '')) && get(category, 'customIcon', '') !== '';

        return(
            <Fragment>
                { showPreloader && <Preloader /> }
                { !showPreloader && (
                    <div className="atls-page atls-category atls-category-border">
                        <div className="atlas-category atls-category-no-cursor">
                            { !hasCustomImage && get(category, 'icon') && <div className="a-cat-icon">
                                { get(category, 'icon') && <span style={{color: categoryColor}} className={ get(category, 'icon') }></span>}
                            </div> }
                            { hasCustomImage && (
                                <div className="a-cat-icon">
                                    <div className="a-cat-icon-image">
                                        <img src={get(category, 'customIcon', '')} alt="" />
                                    </div>
                                </div>
                            ) }
                            <div className="a-cat-about">
                                <div className="a-cat-title">{ get(category, 'title', '') }</div>
                                <div className="a-cat-info">{ get(category, 'shortDescription', '') }</div>
                                <div className="a-cat-info a-cat-articles-found">{ get(category, 'articlesFound', '') }</div>
                            </div>
                        </div>
                    </div>
                ) }
                {this._renderArticles()}
            </Fragment>
        )
    }
}

const mapStateToProps = ({ category }: any) => {
    return { category };
}

export default connect(mapStateToProps, { getCategory, navRequest })(Category);
