import React from 'react';
import { withPrefix } from 'gatsby';

const AcBanner = () => (
  <a href="https://artisancollector.com" title="Artisan Collector" target="_blank" rel="noopener noreferrer" className="mb-6 block">
    <img src={withPrefix('/ACbanner_630.jpg')} alt="Artisan mobile survey banner mobile" className="w-full rounded md:hidden" />
    <img src={withPrefix('/ACbanner_1000.jpg')} className="hidden w-full rounded md:block" alt="Artisan desktop survey banner mobile" />
  </a>
);

export default AcBanner;
