import React, { useEffect, useState, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface TimerProps {
  isRunning: boolean;
  onTick?: (time: number) => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onTick, className }) => {
  const [time, setTime] = useState(0);

  const updateTime = useCallback(() => {
    setTime((prevTime) => {
      const newTime = prevTime + 1;
      if (onTick) {
        setTimeout(() => onTick(newTime), 0);
      }
      return newTime;
    });
  }, [onTick]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(updateTime, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, updateTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("font-mono", className)}>
      {formatTime(time)}
    </div>
  );
}; 