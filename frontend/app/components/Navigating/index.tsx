import { Link } from "react-router";
import "./navigating.css";

import Spinner from '../shared/spinner';

const Navigating: React.FC = () => {
  return (
    <div className="navigating flex-column p-3">
      <Spinner />
      Loading...
    </div>
  );
};

export default Navigating;
