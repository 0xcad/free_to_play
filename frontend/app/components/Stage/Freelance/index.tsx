import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '~/context/AppContext';

import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import Icon from '~/components/shared/Icon';

import "./Freelance.css";
import "../Chat/Chat.css";

interface FreelanceTextResponse {
  freelance_text: string | undefined,
  completed: boolean,
  freelance_score: number,
  correct: boolean,
}

interface LetterProps {
  letter: string;
  status: string;
}

import classnames from 'classnames';
import { motion } from "motion/react"

const Letter: React.FC<LetterProps> = ({
  letter, status
}) => {
  return (
    <span
      className={classnames("letter", status)}
    >
      {(letter === " " && status === "error") ? <>&#9608;</> : letter}
    </span>
  )
}

const Freelance = () => {
  const { currentUser, play } = useAppContext();

  const [inputText, setInputText] = useState<string>('');
  const [freelanceText, setFreelanceText] = useState(currentUser?.freelance_text)
  const [freelanceScore, setFreelanceScore] = useState(play.playInstance.freelance_score)
  const [completed, setCompleted] = useState(!currentUser?.freelance_text)

  const [lastKey, setLastKey] = useState('')
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement>(null);

  function findMismatchIndex(str1: string, str2: string): number {
    const minLength = Math.min(str1.length, str2.length);

    for (let i = 0; i < minLength; i++) {
      if (str1[i] !== str2[i]) {
        return i;
      }
    }

    // If one string is a prefix of the other, return the length of the shorter string
    let res = minLength;
    return res;
  }
  const indexDiff = useMemo(() => {
    return freelanceText ? findMismatchIndex(inputText, freelanceText) : 10000000000000
  }, [inputText, freelanceText]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      var response : FreelanceTextResponse = await Api.post(apiUrls.play.freelance, {freelance_text: inputText});
      if (response.correct) {
        setInputText('');
        setFreelanceScore(Math.max(response.freelance_score, freelanceScore + 25))
        toast.success("I'm proud of you")
      } else {
        setFreelanceScore(response.freelance_score)
        toast.error("incorrect! check your text for errors.")
      }
      setCompleted(response.completed)
      setFreelanceText(response.freelance_text)
    } catch (err) {
      toast.error(err);
    }
  };

  if (!currentUser)
    return (<p>Loading current user...</p>);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // do not let user type too much wrong shit
    if (
      ((inputText.length - indexDiff > 5) ||
      (inputText === freelanceText)) && lastKey !== "Backspace"
    )
      return;
    setInputText(e.target.value);
  }

  useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus(); // Focus the input on component mount
        }
  }, []);

  return (
    <div className='chat-container flex-column flex-grow'>
      <p className="my-1 mt-3 flex-center"> <Icon icon="bux"/> <b>Freelance Bux</b>: {freelanceScore} <Icon icon="bux"/></p>
      <p className="sm my-1"><i>Earn Freelance Bux in the typing minigame. Freelance Bux cannot be used in the store.</i></p>
      {!freelanceText ? (
        <p>You've completed all of your prompts for the game!! I'm proud of you. You're a high value independent contributor.</p>
      ) : (
      <>
       <div className="flex-grow no-touch overflow-y-auto mt-1">
          <span>Prompt &gt;</span>
          <div className="no-touch">
              {freelanceText.split('').map((c, i) => {
                let status = "";
                if  (i < indexDiff)
                  status = "correct";
                else if (i < inputText.length)
                  status = "error";

                return (
                  <>
                  {i === inputText.length && (
                    <motion.div className={classnames("cursor", isFocused ? "blink" : "")}>|</motion.div>
                  )}
                  <Letter
                    letter={c}
                    status={status}
                  />
                  </>

                )
              })}
          </div>
       </div>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          ref={inputRef}
          value={inputText}
          onChange={handleInput}
          onKeyDown={(e) => setLastKey(e.key)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={"Type out the above prompt"}
          disabled={completed}
        />
        <button
          type="submit"
        >
        <Icon icon="send"/>
        </button>
      </form>
      </>
      )}
    </div>
  );
};

export default Freelance;
