import { useState, useEffect } from 'react';

/**
 * A custom hook to manage a countdown timer to a target date.
 * @param {Date} targetDate - The future date to count down to.
 * @returns {{days: number, hours: number, minutes: number, seconds: number}} - The remaining time.
 */
const useCountdown = (targetDate) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountDown = countDownDate - new Date().getTime();
      if (newCountDown > 0) {
        setCountDown(newCountDown);
      } else {
        setCountDown(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

export default useCountdown;