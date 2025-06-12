import { useRef, useState, useEffect } from "react";
import Api from '~/utils/api';
import { apiUrls } from '~/constants/api';

import { toast } from 'react-toastify';

interface TimerProps {
  remainingTime: string;
  endTime: string;
  showControls?: bool;
};

const Timer: React.FC<TimerProps> = ({
  remainingTime, endTime, showControls,
}) => {
  const [myRemainingTime, setMyRemainingTime] = useState(remainingTime);
  const [myEndTime, setMyEndTime] = useState(endTime);

  const startTimer = async () => {
    try {
      // can optionatally provide {duration: <duration>} to set timer dur. defaults to five minutes.
      const response = await Api.post(apiUrls.play.start_timer);
      setMyRemainingTime(response.remaining_time);
      setMyEndTime(response.end_time);
    } catch (error) {
      console.log(error);
      toast.error("couldn't start timer");
    }
  }

  const resetTimer = async () => {
    try {
      // can optionatally provide {duration: <duration>} to set timer dur. defaults to five minutes.
      const response = await Api.post(apiUrls.play.reset_timer);
      setMyRemainingTime(response.remaining_time);
      setMyEndTime(response.end_time);
    } catch (error) {
      console.log(error);
      toast.error("couldn't reset timer");
    }
  }

  const pauseTimer = async () => {
    try {
      setMyEndTime(null);
      const response = await Api.post(apiUrls.play.pause_timer, {now: new Date().toISOString()});
      setMyRemainingTime(response.remaining_time);
      setMyEndTime(response.end_time);
    } catch (error) {
      setMyEndTime(endTime);
      console.log(error);
      toast.error("couldn't pause timer");
    }
  }

  // count down
  useEffect(() => {
    setMyEndTime(endTime);
    setMyRemainingTime(remainingTime);
  }, [endTime, remainingTime]);

  useEffect(() => {
    if (myEndTime) {
      const end = new Date(myEndTime).getTime();

      const update = () => {
        const now = new Date().getTime();
        const deltaSec = Math.max(Math.floor((end - now) / 1000), 0);
        setMyRemainingTime(deltaSec);
      };

      update(); // Initial sync
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [myEndTime, myRemainingTime]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  return (
    <>
      {showControls && (
        <>
          {!myEndTime && (
            <>
              <button onClick={startTimer}>start time</button>
              <button onClick={resetTimer}>reset timer</button>
            </>
          )}
          {myEndTime && (<button onClick={pauseTimer}>pause timer</button>)}
        </>
      )}
      <span>{formatTime(myRemainingTime)}</span>
    </>
  );
}

export default Timer;
