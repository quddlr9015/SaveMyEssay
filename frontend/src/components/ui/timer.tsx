import React, { useEffect, useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface TimerProps {
  isRunning: boolean;
  onTick?: (time: number) => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onTick, className }) => {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const updateTime = useCallback(() => {
    if (!isPaused) {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        if (onTick) {
          setTimeout(() => onTick(newTime), 0);
        }
        return newTime;
      });
    }
  }, [onTick, isPaused]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      intervalId = setInterval(updateTime, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, updateTime, isPaused]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="font-mono">{formatTime(time)}</div>
      {isRunning && (
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePause}
          className="h-8 w-8"
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}; 