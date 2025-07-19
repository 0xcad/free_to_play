import type { ChatMessage } from '~/models/ChatMessage';
import type { User } from '~/models/User';

import UserInfo from '~/components/shared/UserInfo';

interface MessageProps {
  message: ChatMessage;
  currentUser: User;
}

const Message: React.FC<MessageProps> = ({ message, currentUser }) => {
  return (
    <div>
      <div className='chat-message__date'>{new Date(message.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>

      <div className='chat-message__content'>
        <UserInfo user={message.user} currentUser={currentUser} />
        {': '}
        {message.content}
      </div>
    </div>
  );
};

export default Message;
