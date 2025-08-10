import { Link } from "react-router";
import routes from "~/constants/routes";
import {useAppContext} from "~/context/AppContext";

import Icon from '~/components/shared/Icon';

const Waiting: React.FC = () => {
  const { store } = useAppContext();
  return (
    <div>
      <p>The play will begin shortly.</p>
      <div className="buttons">
        <Link to={routes.program.link}><button className='flex-center'><Icon icon='program' size="lg" />Read the program</button></Link>
        <Link to={routes.tutorial.link}><button className='flex-center'><Icon icon='help' size="lg" />Read the tutorial</button></Link>
        <button onClick={() => {store.setBuyGemsModalIsOpen(true);}} className="primary py-2 txt-md">Buy Gems</button>
      </div>
    </div>
  );
};

export default Waiting;
