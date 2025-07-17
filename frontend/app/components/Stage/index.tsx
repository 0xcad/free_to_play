import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';
import Timer from '~/components/shared/timer';
import Inventory from '~/components/Store/Inventory';

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
      <h1>stage</h1>
      { play.playInstance?.stream_url && (
      <div className='yt-embed-holder'>
        <iframe width="560" height="315" src={play.playInstance.stream_url + "&autoplay=1&controls=0&color=white&playsinline=1&enablejsapi=1"} title="Free to Play video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      )}
      <p>Timer: <Timer endTime={play.playInstance.end_time} remainingTime={play.playInstance.remaining_time}/></p>
      {play.playInstance.current_player && (<p>Current Player: <b>{play.playInstance.current_player.name}</b></p>)}
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
