import classnames from 'classnames';

import type { User } from '~/models/user';
import "./UserInfo.css";

import Icon from '~/components/shared/Icon';

interface UserInfoProps {
  user: User;
};

const UserInfo: React.FC<UserInfoProps> = ({
  user,
}) => {

  return (
    <span className={classnames(
        'user-info',
        user.is_me ? 'me' : '',
        user.is_admin ? 'admin' : '',
        user.is_muted ? 'muted' : '',
        user.is_participating ? '' : 'not-participating',
    )}>
      {(user.is_admin || user.is_me) && (
        <span className="user-info__icon">
          {user.is_admin && (<span><Icon icon='admin' /></span>)}
          {user.is_me && (<span className="user-info__tag">me</span>)}
        </span>
      )}
      <span>{user.name}</span>
      {user.verified > 0 && (
        <><div className="spacer" />
        {Array.from({ length: user.verified }, (_, index) => (
          <span className='gems-blue' key={index}><Icon icon='verified' /></span>
        ))}</>
      )}
      {user.has_superchat && (
        <><div className="spacer" /><span>🔊</span></>
      )}
    </span>
  );
}

export default UserInfo;
