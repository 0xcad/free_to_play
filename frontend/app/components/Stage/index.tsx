import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';
import Timer from '~/components/shared/timer';
import Inventory from '~/components/Store/Inventory';

import UserInfo from '~/components/shared/UserInfo';
import Icon from '~/components/shared/Icon';

import {useState} from 'react';
import classnames from 'classnames';

import { motion } from "motion/react"

import "./stage.css";

{/* TODO: make this a tab component, make tabs not unmount when you click off... */}
const Tabs: React.FC<{selectedTab: string, setSelectedTab: (tab: string) => void}> = ({selectedTab, setSelectedTab}) => {
  return (
    <div className='tabs'>
      <div className='tab-list'>
        <button className={classnames('tab button w-auto flex-center', selectedTab === 'chat' ? 'active' : '')} onClick={() => setSelectedTab('chat')}>
          {selectedTab == 'chat' ?  <motion.div
              className="underline"
              layoutId="underline"
              id="underline"
              transition={{ type: "spring", bounce: 0.25 }}
          /> : null}
          <span className="flex-center w-100 option__text"><Icon icon='chat' /> Chat</span>
        </button>
        <button className={classnames('tab button w-auto flex-center', selectedTab === 'inventory' ? 'active' : '')} onClick={() => setSelectedTab('inventory')}>
        {selectedTab == 'inventory' ? <motion.div
                className="underline"
                layoutId="underline"
                id="underline"
                transition={{ type: "spring", bounce: 0.25 }}
          /> : null}

          <span className="flex-center w-100 option__text"><Icon icon='inventory' /> Inventory</span>
        </button>
      </div>
      <div className='tab-content'>
        {selectedTab === 'chat' && <Chat />}
        {selectedTab === 'inventory' && <Inventory />}
      </div>
   </div>
  );
}

const Stage: React.FC = () => {
  const { currentUser, play/*, chat*/ } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<string>('chat');

  if (!play || play.playInstance?.status == 'waiting') {
    return (
      <>
      <h1>stage</h1>
      <Waiting />
      </>
    );
  }

  return (
    <>
      { play.playInstance?.stream_url && (
      <div className='yt-embed-holder'>
        <iframe width="560" height="315" src={play.playInstance.stream_url + "&autoplay=1&controls=0&color=white&playsinline=1&enablejsapi=1"} title="Free to Play video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      )}
      <div className='stage-status'>
        <p>{play.playInstance?.current_player ? (<><UserInfo user={play.playInstance.current_player} currentUser={currentUser} /> is playing</>) : 'Waiting for player selection...'}</p>
        <Timer endTime={play.playInstance.end_time} remainingTime={play.playInstance.remaining_time}/>
      </div>
      <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      {/*<div className='tabs'>
        <div className='tab-list'>
          <button className={classnames('tab button w-auto flex-center', selectedTab === 'chat' ? 'active' : '')} onClick={() => setSelectedTab('chat')}>
            <Icon icon='chat' /> Chat
          </button>
          <button className={classnames('tab button w-auto flex-center', selectedTab === 'inventory' ? 'active' : '')} onClick={() => setSelectedTab('inventory')}>
            <Icon icon='inventory' /> Inventory
          </button>
        </div>
        <div className='tab-content'>
          {selectedTab === 'chat' && <Chat />}
          {selectedTab === 'inventory' && <Inventory />}
        </div>
     </div>*/}
    </>
  );
};

export default Stage;
