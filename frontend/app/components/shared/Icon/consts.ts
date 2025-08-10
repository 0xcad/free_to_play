import {
  FaGem,
  FaRegUserCircle,
  FaPaperPlane,
  FaPlay, FaPause,
  FaRegQuestionCircle,
} from "react-icons/fa";

import {
  LuTheater,
} from "react-icons/lu";

import {
  PiTreasureChestDuotone,
  PiChatDotsDuotone,
  PiBackpackDuotone,
  PiBookOpenBold,
} from "react-icons/pi";

export const iconMap = {
  chat: PiChatDotsDuotone,
  chest: PiTreasureChestDuotone,
  gem: FaGem,
  inventory: PiBackpackDuotone,
  pause: FaPause,
  play: FaPlay,
  program: PiBookOpenBold,
  send: FaPaperPlane,
  help: FaRegQuestionCircle,
  theater: LuTheater,
  user: FaRegUserCircle,
};

export const iconSizes = {
  sm: '0.9em',
  md: '1.1em',
  lg: '1.4em',
};
