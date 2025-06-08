import type { ChatMessage } from '~/models/ChatMessage';
import type { User } from '~/models/User';

interface MessageProps {
  message: ChatMessage;
  currentUser: User;
}

const Message: React.FC<MessageProps> = ({ message, currentUser }) => {
  return (
    <>
      <pre>
      {new Date(message.created).toLocaleTimeString()}{' | '}
      {message.user.id === currentUser.id ? (<b>{message.user?.name}</b>) : message.user?.name}: {message.content}
      </pre>
    </>
  );
};

export default Message;
