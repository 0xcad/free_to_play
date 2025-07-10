import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';
import Timer from '~/components/shared/timer';

const Stage: React.FC = () => {
  const { currentUser, play/*, chat*/ } = useAppContext();

  if (!play || play.playInstance?.status == 'waiting') {
    return <Waiting />
  }

  return (
    <>
      <h1>stage</h1>
      <p>Timer: <Timer endTime={play.playInstance.end_time} remainingTime={play.playInstance.remaining_time}/></p>
      {play.playInstance.current_player && (<p>Current Player: <b>{play.playInstance.current_player.name}</b></p>)}
      {/*<Chat
        messages={chat.messages}
        setMessages={chat.setMessages}
      />*/}
     <Chat />
    </>
  );
};

export default Stage;
