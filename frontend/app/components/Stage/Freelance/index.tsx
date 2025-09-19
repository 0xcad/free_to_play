import { useState } from 'react';
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
  freelance_score: number 
}

 const Freelance = () => {
  const { currentUser, play } = useAppContext();

  const [inputText, setInputText] = useState<string>('');
  const [freelanceText, setFreelanceText] = useState(currentUser?.freelance_text)
  const [freelanceScore, setFreelanceScore] = useState(play.playInstance.freelance_score)
  const [completed, setCompleted] = useState(!currentUser?.freelance_text)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      var response : FreelanceTextResponse = await Api.post(apiUrls.play.freelance, {freelance_text: inputText});
      setInputText('');
      setCompleted(response.completed)
      setFreelanceText(response.freelance_text)
      setFreelanceScore(Math.max(response.freelance_score, freelanceScore + 1))
        // setCurrentUser({...currentUser, freelance_text: response.freelance_text}
      toast.success("I'm proud of you")
    } catch (err) {
    }
  };

  if (!currentUser)
    return (<p>Loading current user...</p>);

  return (
    <div className='chat-container flex-column flex-grow'>
      <p className="my-1">$$ <b>Freelance Bux</b>: {freelanceScore} $$</p>
      <p className="sm my-1"><i>Earn Freelance Bux in the typing minigame. Freelance Bux cannot be used in the store.</i></p>
      {completed ? (
        <p>You've completed all of your prompts for the game!! I'm proud of you. You're a high value independent contributor.</p>
      ) : (
      <ul
        className="chat-messages flex-grow overflow-y-auto mt-1 no-touch"
      >
        <li className='freelanceText no-touch'>Prompt &gt;<br/> {freelanceText}</li>
      </ul>
      )}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={"Type out the above prompt"}
          disabled={completed}
        />
        <button
          type="submit"
        >
        <Icon icon="send"/>
        </button>
      </form>
    </div>
  );
};

export default Freelance;
