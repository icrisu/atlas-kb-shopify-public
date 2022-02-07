import React from 'react';
import { get } from 'lodash';

const SocialLinks = ({shop}: any) => {
    
    const linkedin = get(shop, 'settings.linkedin', '');
    const facebook = get(shop, 'settings.facebook', '');
    const twitter = get(shop, 'settings.twitter', '');
    const instagram = get(shop, 'settings.instagram', '');
    const contactUrl = get(shop, 'settings.contactUrl', '');
    return (
        <div className="atls-social-ui">
            <ul className="atls-social-list">
                { linkedin !== '' && <li><a href={linkedin} target="_blank"><span className="unf-social-linkedin"></span></a></li> }
                { facebook !== '' && <li><a href={facebook} target="_blank"><span className="unf-social-facebook"></span></a></li> }
                { twitter !== '' && <li><a href={twitter} target="_blank"><span className="unf-social-twitter"></span></a></li> }
                { instagram !== '' && <li><a href={instagram} target="_blank"><span className="unf-instagram1"></span></a></li> }
                { contactUrl !== '' && <li><a href={contactUrl} target="_blank"><span className="unf-envelope"></span></a></li> }
            </ul>
        </div>
    );
  };
export default SocialLinks;
