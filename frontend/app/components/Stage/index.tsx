import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';
import Freelance from './Freelance';

import UserInfo from '~/components/shared/UserInfo';
import Icon from '~/components/shared/Icon';

import type {User} from '~/models/User';

import {useState} from 'react';
import classnames from 'classnames';

import { motion } from "motion/react"

import "./stage.css";

{/* TODO: make this a tab component, make tabs not unmount when you click off... */}
const Tabs: React.FC<{
  selectedTab: string,
  setSelectedTab: (tab: string) => void,
}> = ({selectedTab, setSelectedTab}) => {
  return (
    <div className='tabs overflow-hidden flex-column'>
      <div className='tab-list'>
        {["chat", "freelance"].map((tab) => (
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
        {selectedTab === 'chat' && <Chat />}
        {selectedTab === 'freelance' && (<Freelance />) }
      </div>
   </div>
  );
}

const Stage: React.FC = () => {
  const { currentUser, play, users } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<string>('chat');

  const currentPlayer = play.playInstance.current_player ?
    {...users.users[play.playInstance.current_player], is_me: currentUser?.id === play.playInstance.current_player}
  : undefined;

  if (!play || play.playInstance?.status == 'waiting') {
    return (
      <motion.div
        initial={{ marginRight: -200 }}
        animate={{ marginRight: 0 }}
        transition={{ type: "spring", bounce: 0.25 }}
        className="p-2"
      >
      <h1>stage</h1>
      <Waiting />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ marginRight: -200 }}
      animate={{ marginRight: 0 }}
      transition={{ type: "spring", bounce: 0.25 }}
      className="flex-grow flex-column"
    >
      { play.playInstance?.stream_url && (
      <div
          className={classnames(
            'yt-embed-holder overflow-hidden',
            selectedTab === 'freelance' ? 'yt-embed-holder__minimized' : ''
          )}
        >
        <iframe
          src={play.playInstance.stream_url}
          height="100%"
          width="100%"
          allowFullScreen
        >
        </iframe>

      </div>
      )}
      <div className='stage-status'>
        <p className="sm my-0">{play.playInstance?.current_player ? (<><UserInfo user={currentPlayer} /> is playing</>) : 'Waiting for player selection...'}</p>
      </div>
      <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
    </motion.div>
  );
};

export default Stage;
