import React, { PureComponent, Fragment } from 'react';
// @ts-ignore
import { connect } from 'react-redux';
import { get, isNil, isEmpty } from 'lodash';
import { getArticle, navRequest } from '../../actions';
import Preloader from '../../components/preloader';
import { AVAILABLE_SCREENS } from '../../constants';

class Article extends PureComponent<any, any> {

    componentDidMount() {
        try {
            // @ts-ignore
            document.getElementById('atls-scroll').scrollTop = 0
        } catch (err) {}
        const { slug } = this.props;
        this.props.getArticle(slug);
    }

    render() {
        const { article } = this.props;
        const showPreloader: boolean = isEmpty(article) || isNil(article);
        return(
            <Fragment>
                { showPreloader && <Preloader /> }
                { !showPreloader && (
                    <div className="atls-page atls-article-content">
                        <h3 className="atls-article-title">{ get(article, 'title') }</h3>
                        <div className="atls-article.content-body" dangerouslySetInnerHTML={{ __html: `${get(article, 'content')}` }}></div>
                    </div>
                ) }
            </Fragment>
        )
    }
}

const mapStateToProps = ({ article }: any) => {
    return { article };
}

export default connect(mapStateToProps, { getArticle, navRequest })(Article);
