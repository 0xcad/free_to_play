import type { Route } from "./+types/home";
import { useAppContext } from '~/context/AppContext';

import routes from '~/constants/routes';
import { useNavigate } from "react-router";
import Storage from '~/utils/storage';
import { SESSION_KEY } from '~/constants/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free to Play | Account" },
    { name: "description", content: "Free to Play, or Pay What You Will" },
  ];
}

const Account: React.FC = () => {
  let navigate = useNavigate();
  const { currentUser, setToken } = useAppContext();

  const handleLogout = () => {
    // TODO: make a backend request to invalidate current key. but anyways...
    Storage.remove(SESSION_KEY);
    setToken('');
    navigate(`${routes.join.link}`);
  };

  if (!currentUser)
    return (<p>Loading current user...</p>)

  return (
    <>
      <h1>Account</h1>
      <span>Name: {currentUser.name}</span><br />
      <span>Email: {currentUser.email}</span><br />
      <span>Participating: {currentUser.is_participating ? "yes" : "no"}</span><br />
      <span>Balance: {currentUser.balance} gems</span>

      <p><button onClick={handleLogout}>Log out</button></p>
    </>
  );
};

export default Account;
