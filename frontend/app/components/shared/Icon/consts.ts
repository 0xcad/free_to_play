import {
  FaArrowLeft,
  FaGem,
  FaRegUserCircle,
  FaPaperPlane,
  FaPlay, FaPause,
  FaRegQuestionCircle,
} from "react-icons/fa";

import { FaCrown, FaXmark } from "react-icons/fa6";

import {
  LuTheater,
} from "react-icons/lu";

import { RiVerifiedBadgeFill } from "react-icons/ri";

import {
  PiTreasureChestDuotone,
  PiChatDotsDuotone,
  PiBackpackDuotone,
  PiBookOpenBold,
} from "react-icons/pi";

import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";

export const iconMap = {
  admin: FaCrown,
  back: FaArrowLeft,
  chat: PiChatDotsDuotone,
  chest: PiTreasureChestDuotone,
  close: FaXmark,
  freelance: GiReceiveMoney,
  gem: FaGem,
  inventory: PiBackpackDuotone,
  pause: FaPause,
  play: FaPlay,
  program: PiBookOpenBold,
  send: FaPaperPlane,
  help: FaRegQuestionCircle,
  theater: LuTheater,
  waiting: LuTheater,
  swag: GiPayMoney,
  user: FaRegUserCircle,
  verified: RiVerifiedBadgeFill,
};

export const iconSizes = {
  sm: '0.9em',
  md: '1.1em',
  lg: '1.4em',
};
