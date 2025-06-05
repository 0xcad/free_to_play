import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

import Waiting from './waiting';

const Stage: React.FC = () => {
  const { currentUser, play, chat } = useAppContext();

  if (!play || play.playInstance?.status == 'waiting') {
    return <Waiting />
  }

  return (
    <p>stage</p>
  );
};

export default Stage;
