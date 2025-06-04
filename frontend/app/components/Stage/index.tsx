import type { Route } from "./+types/stage";
import { useAppContext } from '~/context/AppContext';

const Stage: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <p>stage</p>
  );
};

export default Stage;
