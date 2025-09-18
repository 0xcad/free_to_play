import type { ChatMessage } from '~/models/ChatMessage';
import type { User } from '~/models/User';

import UserInfo from '~/components/shared/UserInfo';

interface MessageProps {
  message: ChatMessage;
  user: User;
}

const Message: React.FC<MessageProps> = ({ message, user }) => {
  return (
    <div>
      <div className='chat-message__date'>{new Date(message.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>

      {message.system ? (
        <div className='chat-message__content system'>
          <span>*</span>
          <UserInfo user={user} />
          {' '} purchased {' '}
          {message.content}
          <span>*</span>
        </div>
      ) : (
        <div className='chat-message__content'>
          <UserInfo user={user} />
          {': '}
          {message.content}
        </div>
      )}
    </div>
  );
};

export default Message;
