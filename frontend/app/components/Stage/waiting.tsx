import { Link } from "react-router";
import routes from "~/constants/routes";
import {useAppContext} from "~/context/AppContext";

const Waiting: React.FC = () => {
  const { store } = useAppContext();
  return (
    <div>
      <p>We are currently waiting for the play to start. What can you do right now?</p>
      <p><Link to={routes.program.link}>Read the program</Link></p>
      <p><Link to={routes.tutorial.link}>Read the tutorial</Link></p>
      <p><a href="#" onClick={() => {store.setBuyGemsModalIsOpen(true);}}>Buy Gems</a></p>
    </div>
  );
};

export default Waiting;
