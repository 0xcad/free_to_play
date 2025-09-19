import type { Route } from "./+types/program";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Program" },
    { name: "description", content: "Free to Play Program" },
  ];
}

import { Link } from "react-router";
import Icon from '~/components/shared/Icon';

import "./program.css";

export default function Program() {
  const actorsMap = [
    ["Doomer Guy", "Rusty Daniel"],
    ["Streamer", "Spencer Byham-Carson"],
    ["John Money", "Truman Zephyr"],
    ["Doomer Guy's Wife", "Madeline Scotti"],
    ["Hulu Soldier", "Evan Vines"],
    ["Pirate", "Dan Evans"],
  ]

  const crewMap = [
    ["Director", "Cole Schubert"],
    ["Producer/Stage Manager", "Anya Hilpert"],
    ["Lighting Designer", "Delaney Price"],
    ["Game Designer", "Lucia Shen"],
    ["Website Developer", "Cassidy Diamond"],
    ["Fun and Laffs", "Zachary Everett-Lane"]
  ]

  return (
    <div className="p-3">
      <h1>program</h1>
      <p>A lot of really talented individuals came together to make this show possible!</p>
      <p>You can read the full program, complete with bios and headshots, on the <a href="https://www.fishtanktheatercompany.com/free-to-play" target="_blank">Fish Tank Theater Company</a> website.</p>

      <h2>Actors</h2>
      <ul className='program my-0'>
        {actorsMap.map((row) => (
          <li className="sm"><span>{row[0]}</span> &#x2022; <span>{row[1]}</span></li>
        ))}
      </ul>
      <h2>Crew</h2>
      <ul className='program mt-0'>
        {crewMap.map((row) => (
          <li className="sm"><span>{row[0]}</span> &#x2022; <span>{row[1]}</span></li>
        ))}
      </ul>

      <p>Special thank you to The Frank-Ratchye STUDIO for Creative Inquiry for their generous <a href="https://studioforcreativeinquiry.org/csx-grant" target="_blank">CS+X grant</a></p>

      <div className="buttons">
        <Link to="/stage"><button className='flex-center'><Icon icon='theater' size="lg" />Back to Home</button></Link>
      </div>
    </div>
  );
}
