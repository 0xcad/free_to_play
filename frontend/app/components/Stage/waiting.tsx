import { useState } from 'react';
import { Link } from "react-router";
import routes from "~/constants/routes";
import {useAppContext} from "~/context/AppContext";

import Freelance from './Freelance';

import Icon from '~/components/shared/Icon';

import classnames from 'classnames';
import { motion } from "motion/react"

const Waiting: React.FC = () => {
  const { store } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<string>('waiting');

  return (
    <div className='tabs flex-column'>
      <div className='tab-list'>
        {["waiting", "freelance"].map((tab) => (
          <button key={tab} className={classnames('tab button w-auto flex-center', selectedTab === tab ? 'active' : '')} onClick={() => setSelectedTab(tab)}>
            {selectedTab == tab ?  <motion.div
                className="underline"
                layoutId="underline"
                id="underline"
                transition={{ type: "spring", bounce: 0.4 }}
            /> : null}
            <span className="flex-center w-100 option__text"><Icon icon={tab} /> {tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>
      <div className='tab-content flex-column'>
        {selectedTab === 'waiting' && (
          <div>
            <p>The play will begin shortly.</p>
            <div className="buttons">
              <Link to={routes.program.link}><button className='flex-center'><Icon icon='program' size="lg" />Read the program</button></Link>
              <Link to={routes.tutorial.link}><button className='flex-center'><Icon icon='help' size="lg" />Read the tutorial</button></Link>
              <button onClick={() => {store.setBuyGemsModalIsOpen(true);}} className="primary py-2 txt-md">Buy Gems</button>
            </div>
          </div>
        )}
        {selectedTab === 'freelance' && (<Freelance />) }
      </div>
   </div>
  );
};

export default Waiting;
