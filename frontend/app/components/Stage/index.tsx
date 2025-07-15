import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';
import Timer from '~/components/shared/timer';
import Inventory from '~/components/Store/Inventory';

import {useState} from 'react';

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
