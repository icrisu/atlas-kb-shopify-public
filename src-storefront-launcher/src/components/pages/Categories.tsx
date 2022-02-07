import React, { PureComponent } from 'react';
import { Motion, spring } from 'react-motion';
// @ts-ignore
import { connect } from 'react-redux';
import { get, isArray, isNil } from 'lodash';
import { getCategories, navRequest, breadcrumbNavRequest } from '../../actions';
import Preloader from '../../components/preloader';
import { AVAILABLE_SCREENS } from '../../constants';

class Categories extends PureComponent<any, any> {

    componentDidMount() {
        try {
            // @ts-ignore
            document.getElementById('atls-scroll').scrollTop = 0
        } catch (err) {}
        this.props.getCategories();
    }

    _onCategoryClick(event: any, catSlug: string) {
        event.preventDefault();
        this.props.navRequest({
            screen: AVAILABLE_SCREENS.category,
            slug: catSlug
        })
    }

    _renderCategories() {

        const { categories, shop } = this.props;
        if (isArray(categories) && categories.length === 0) {
            return <p style={{ padding: 10 }}>{ get(shop, 'locales.categoriesNotFound', '') }</p>;
        }
        if (!isArray(categories)) {
            return <noscript />;
        }
        let count: number = 0;
        return categories.map((category: any) => {
            const catCls: string = count === categories.length - 1 ? `atlas-category` : `atlas-category atls-category-border`;
            const categoryColor: string = get(category, 'categoryColor') && get(category, 'categoryColor') !== '' ? get(category, 'categoryColor') : '#3d4246';
            count++;

            const hasCustomImage: boolean = !isNil(get(category, 'customIcon', '')) && get(category, 'customIcon', '') !== '';

            return(
                <a href="#" key={`cat-${count}`} className={ catCls } onClick={ (event) => this._onCategoryClick(event, get(category, 'slug', '')) }>
                    { !hasCustomImage && get(category, 'icon') && <div className="a-cat-icon">
                        { get(category, 'icon') && <span style={{color: categoryColor}} className={ get(category, 'icon') }></span>}
                    </div> }
                    { hasCustomImage && (
                        <div className="a-cat-icon a-cat-icon-image">
                            <div className="a-cat-icon-image">
                                <img src={get(category, 'customIcon', '')} alt="" />
                            </div>
                        </div>
                    ) }
                    <div className="a-cat-about">
                        <div className="a-cat-title">{ get(category, 'title', '') }</div>
                        <div className="a-cat-info">{ get(category, 'shortDescription', '') }</div>
                    </div>
                </a>
            )
        });
    }

    render() {
        const { categories, shop } = this.props;
        const showPreloader: boolean = !isArray(categories);
        return(
            <div className="atls-page atls-categories">
                { showPreloader && <Preloader /> }
                { !showPreloader && this._renderCategories() }
            </div>
        )
    }
}

const mapStateToProps = ({ categories, shop }: any) => {
    return { categories, shop };
}

export default connect(mapStateToProps, { getCategories, navRequest, breadcrumbNavRequest })(Categories);
