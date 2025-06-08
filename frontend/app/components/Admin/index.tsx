import type { Route } from "./+types/admin";
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import Chat from '~/components/Stage/Chat';

const Admin: React.FC = () => {
  const { currentUser, ws } = useAppContext();

  const kickUser = async (user_id: string, onSuccess?: () => void) => {
    try {
      await Api.post(apiUrls.chat.kick, {user_id: user_id});
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
    };
  }
  const muteUser = async (user_id: string, onSuccess?: () => void) => {
    try {
      await Api.put(apiUrls.chat.mute, {user_id: user_id});
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
    };
  }
  const unmuteUser = async (user_id: string, onSuccess?: () => void) => {
    try {
      await Api.delete(apiUrls.chat.mute, {user_id: user_id});
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log(error);
    };
  }


  return (
    <>
      <h1>Admin Panel</h1>

      <Chat
        kickUser={kickUser}
        muteUser={muteUser}
        unmuteUser={unmuteUser}
      />
    </>
  );
};

export default Admin;
