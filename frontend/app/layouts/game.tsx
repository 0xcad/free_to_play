
import { Outlet, NavLink  } from "react-router";

export default function GameLayout() {
  return (
    <>
      <nav>
        <NavLink to="/stage" end>
          Home
        </NavLink>
        <NavLink to="/store" end>Store</NavLink>
        <NavLink to="/account">Account</NavLink>
      </nav>
      <Outlet />
    </>
  );
};

//export default GameLayout;
