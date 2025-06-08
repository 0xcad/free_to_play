import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';
import Chat from './Chat';

const Stage: React.FC = () => {
  const { currentUser, play/*, chat*/ } = useAppContext();

  if (!play || play.playInstance?.status == 'waiting') {
    return <Waiting />
  }

  return (
    <>
      <p>stage</p>
      {/*<Chat
        messages={chat.messages}
        setMessages={chat.setMessages}
      />*/}
     <Chat />
    </>
  );
};

export default Stage;
