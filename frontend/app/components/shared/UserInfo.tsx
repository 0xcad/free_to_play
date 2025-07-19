import { useRef, useState, useEffect } from "react";

import classnames from 'classnames';

import type { User } from '~/models/user';
import "./UserInfo.css";

import { FaCrown } from "react-icons/fa6";

interface UserInfoProps {
  user: User;
  currentUser?: User;
};

const UserInfo: React.FC<UserInfoProps> = ({
  user, currentUser
}) => {

  const [isCurrentUser, setIsCurrentUser] = useState(false);
  useEffect(() => {
    if (currentUser)
      setIsCurrentUser(currentUser.id === user.id);
  }, [currentUser, user]);

  return (
    <div className={classnames(
        'user-info',
        isCurrentUser ? 'me' : '',
        user.is_admin ? 'admin' : '',
        user.is_muted ? 'muted' : '',
        user.is_participating ? '' : 'not-participating',
    )}>
      {(user.is_admin || isCurrentUser) && (
        <span className="user-info__icon">
          {user.is_admin && (<span className='icon'><FaCrown /></span>)}
          {isCurrentUser && (<span className="user-info__tag">me</span>)}
        </span>
      )}
      <span>{user.name}</span>
    </div>
  );
}

export default UserInfo;
