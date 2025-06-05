import { Link } from "react-router";
import routes from "~/constants/routes";

const Waiting: React.FC = () => {
  return (
    <div>
      <p>We are currently waiting for the game to start. What can you do right now?</p>
      <p><Link to={routes.program.link}>Read the program</Link></p>
      <p><Link to={routes.tutorial.link}>Read the tutorial</Link></p>
    </div>
  );
};

export default Waiting;
