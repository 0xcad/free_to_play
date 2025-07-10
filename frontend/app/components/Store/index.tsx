import type { Route } from "./+types/store";
import { useAppContext } from '~/context/AppContext';

const Store: React.FC = () => {
  const { currentUser, play, store } = useAppContext();

  return (
    <>
      <h1>store</h1>
    </>
  );
};

export default Store;
