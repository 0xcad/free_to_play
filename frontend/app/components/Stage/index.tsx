import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';
import Timer from '~/components/shared/timer';
import Inventory from '~/components/Store/Inventory';

import UserInfo from '~/components/shared/UserInfo';

import {useState} from 'react';

import "./stage.css";

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
      <div className='tabs'>
        <div className='tab-list'>
          <button className={`tab ${selectedTab === 'chat' ? 'active' : ''}`} onClick={() => setSelectedTab('chat')}>Chat</button>
          <button className={`tab ${selectedTab === 'inventory' ? 'active' : ''}`} onClick={() => setSelectedTab('inventory')}>Inventory</button>
        </div>
        <div className='tab-content'>
          {selectedTab === 'chat' && <Chat />}
          {selectedTab === 'inventory' && <Inventory />}
        </div>
     </div>
    </>
  );
};

export default Stage;
