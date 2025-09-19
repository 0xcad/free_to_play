import type { Route } from "./+types/tutorial";
import {useAppContext} from "~/context/AppContext";
import { Link } from "react-router";
import Icon from '~/components/shared/Icon';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tutorial" },
    { name: "description", content: "Free to Play Tutorial" },
  ];
}

export default function Tutorial() {
  const { store } = useAppContext();

  return (
    <div className="p-3">
      <h1>Tutorial</h1>
      <p>While you wait, make sure that you buy <span className="gems-blue">gems</span>, and check out the Freelance Game on the home screen.</p>
      <p>Buying gems will allow you to purchase items in the store, and supports future productions like this one.</p>
      <p>The Freelance Game gives you Freelance Bux, which is an essential component of the game.</p>

      <div className="buttons">
        <Link to="/stage"><button className='flex-center'><Icon icon='theater' size="lg" />Back to Home</button></Link>
        <button onClick={() => {store.setBuyGemsModalIsOpen(true);}} className="primary py-2 txt-md">Buy Gems</button>
      </div>
    </div>
  );
}
