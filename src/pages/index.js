import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sortBy } from 'lodash';
import Layout from '../layouts/base';
import SEO from '../components/seo';
import AsciiArt from '../components/ascii-art';
import { getFavoriteMakers, addFavMaker, removeFavMaker } from '../internal/favorite';
import cn from '../internal/twMerge';

const LOGOS_URL = 'https://media.githubusercontent.com/media/thisisdefinitelyajoke/database-ascii/master/db/logos.ascii.json';

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query MyQuery {
      allSitePage(filter: { id: { glob: "SitePage /maker/*" } }) {
        nodes {
          pageContext
          path
          id
        }
      }
    }
  `);

  const [logos, setLogos] = useState({});

  useEffect(() => {
    fetch(LOGOS_URL)
      .then((res) => (res.ok ? res.json() : {}))
      .then(setLogos)
      .catch(() => setLogos({}));
  }, []);

  const getLogo = (id) => logos[id] || logos.nologo || null;

  const [favoriteMakers, setFavoriteMakers] = useState([]);

  useEffect(() => {
    const faves = getFavoriteMakers();
    if (faves) {
      setFavoriteMakers(faves);
    }
  }, getFavoriteMakers());

  const sortedMakers = sortBy(data.allSitePage.nodes, (n) => !favoriteMakers.includes(n.pageContext.maker.id));

  return (
    <Layout>
      <SEO title="" img={'/android-icon-512x512.png'} />
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
        {sortedMakers.map((element) => (
          <li key={element.id} className="flex flex-col">
            <Link
              to={element.path}
              className={cn(
                'block w-full overflow-hidden rounded-md bg-white shadow-md transition',
                'hover:border-slate-400/80 hover:shadow-lg',
                'dark:border dark:border-slate-600/50 dark:bg-slate-700 dark:text-slate-200 dark:shadow-none',
              )}
            >
              <div className="w-full border-b border-slate-200 bg-white dark:border-b-2 dark:border-slate-600">
                <AsciiArt art={getLogo(element.pageContext.maker.id)} className="block rounded-t-md" fontSize="clamp(0.36rem, 0.5vw, 0.5rem)" />
              </div>
              <div className="text-header flex items-center justify-between gap-x-2 p-4">
                <span className="grow text-center font-semibold max-lg:truncate lg:text-lg lg:font-bold">{element.pageContext.maker.name}</span>
                <button
                  className="p-1 lg:p-px"
                  onClick={(e) => {
                    e.preventDefault();
                    const makers = favoriteMakers.includes(element.pageContext.maker.id)
                      ? removeFavMaker(element.pageContext.maker.id)
                      : addFavMaker(element.pageContext.maker.id);
                    setFavoriteMakers(makers);
                  }}
                >
                  <FontAwesomeIcon
                    id="favStar"
                    className={cn(
                      'top-[14px] ml-auto cursor-pointer',
                      favoriteMakers.includes(element.pageContext.maker.id) ? 'text-yellow-500' : 'text-slate-400',
                    )}
                    icon={['fas', 'star']}
                  />
                </button>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default IndexPage;
