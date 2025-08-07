import { Link } from "react-router";
import routes from "~/constants/routes";
import {useAppContext} from "~/context/AppContext";

const Waiting: React.FC = () => {
  const { store } = useAppContext();
  return (
    <div>
      <p>We are currently waiting for the play to start. What can you do right now?</p>
      <div className="buttons">
        <Link to={routes.program.link}><button>Read the program</button></Link>
        <Link to={routes.tutorial.link}><button>Read the tutorial</button></Link>
        <button onClick={() => {store.setBuyGemsModalIsOpen(true);}} className="primary py-2">Buy Gems</button>
      </div>
    </div>
  );
};

export default Waiting;
