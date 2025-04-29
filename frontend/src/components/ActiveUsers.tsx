import React from 'react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from '../axiosConfig';

import { useAppContext } from '../context/AppContext';

const ActiveUsers: React.FC = () => {
  let navigate = useNavigate();

  const { users, username, isAdmin, token, setUsers, mutedUsers, setMutedUsers } = useAppContext();

  const kick = async (user : string) => {
    try {
      const response = await axios.post('chat/kick/',
                                        { user:user },
                { headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
      if (response.data.success) {
        setUsers(users.filter(u => u !== user));
      }
    } catch (error) {
      console.error('Error kicking user', error);
    }
  };

  const mute = async (user : string) => {
    try {
      const response = await axios.post('chat/mute/',
                                        { user:user },
                { headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
      if (response.data.muted) {
        setMutedUsers([...mutedUsers, user]);
      }
      else if (response.data.unmuted) {
        setMutedUsers(mutedUsers.filter(u => u !== user));
      }

    } catch (error) {
      console.error('Error muting user', error);
    }
  };

  const isMuted = (user : string) => {
    return mutedUsers.includes(user);
  };

  const getRandom = () => {
    function getRandomItem(arr : string[]) {
      if (arr.length === 0) {
        return undefined;
      }
      const randomIndex = Math.floor(Math.random() * arr.length);
      return arr[randomIndex];
    }

    let eligibleUsers = users.filter(u => !mutedUsers.includes(u));
    alert(getRandomItem(users));
  }

  if (!users)
    return (<div></div>);

  return (
    <div>
      <h3>Active Users</h3>
      <ul>
        {users.map((user: string) => (
            <li key={user}>
              {user == username ? (
                <strong>{user} </strong>
              ) : (<>{user} </>)}

              {(isAdmin && user !== username) && (
              <>
                <button onClick={() => {kick(user)}}>Kick</button> |
                <button onClick={() => {mute(user)}}>Mute{isMuted(user) && 'd'}</button>
              </>
              )}
            </li>
          ))}
      </ul>
      {isAdmin && (
        <button onClick={getRandom}>Get Random User</button>
      )}
    </div>
  );
};

export default ActiveUsers;
