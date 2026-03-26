import { useEffect, useRef, useState } from "react";
import GlassDropdown from "./GlassDropdown";

type Technique =
  | "pomodoro"
  | "fifty_two_seventeen"
  | "deep_work"
  | "sprint"
  | "custom";

const techniqueDurations: Record<Technique, number> = {
  pomodoro: 25 * 60,
  fifty_two_seventeen: 52 * 60,
  deep_work: 90 * 60,
  sprint: 20 * 60,
  custom: 0,
};

const techniqueLabels: Record<Technique, string> = {
  pomodoro: "Pomodoro (25 min)",
  fifty_two_seventeen: "52/17 Method (52 min focus)",
  deep_work: "90 Minute Deep Work",
  sprint: "20 Minute Sprint",
  custom: "Custom",
};

const FocusTimerCard = () => {
  const [technique, setTechnique] = useState<Technique>("pomodoro");
  const [seconds, setSeconds] = useState<number>(
    techniqueDurations["pomodoro"]
  );
  const [running, setRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number>(25);

  const intervalRef = useRef<number | null>(null);

  // =========================
  // DROPDOWN OPTIONS
  // =========================
  const techniqueOptions = Object.entries(techniqueLabels).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  // =========================
  // HANDLE TECHNIQUE CHANGE
  // =========================
  useEffect(() => {
    if (technique !== "custom") {
      setSeconds(techniqueDurations[technique]);
      setRunning(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [technique]);

  // =========================
  // CLEANUP
  // =========================
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (running) return;

    setRunning(true);

    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          setRunning(false);

          const audio = new Audio("/alarm.mp3");
          audio.play();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setRunning(false);

    if (technique === "custom") {
      setSeconds(customMinutes * 60);
    } else {
      setSeconds(techniqueDurations[technique]);
    }
  };

  const applyCustomTime = () => {
    if (customMinutes <= 0) return;
    setSeconds(customMinutes * 60);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col p-6 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

      <h3 className="mb-4 text-lg font-semibold">
        Focus Timer
      </h3>

      {/* =========================
          GLASS DROPDOWN (NEW)
      ========================= */}
      <div className="mb-4">
        <GlassDropdown
          options={techniqueOptions}
          value={technique}
          onChange={(val) => setTechnique(val as Technique)}
          placeholder="Select technique"
        />
      </div>

      {/* =========================
          CUSTOM INPUT
      ========================= */}
      <div
        className={`flex gap-2 mb-4 transition-all duration-200 ${
          technique === "custom"
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <input
          type="number"
          min="1"
          value={customMinutes}
          onChange={(e) =>
            setCustomMinutes(Number(e.target.value))
          }
          className="flex-1 px-4 py-2 text-black border rounded-xl bg-white/70 border-white/30"
          placeholder="Minutes"
        />
        <button
          onClick={applyCustomTime}
          className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30"
        >
          Set
        </button>
      </div>

      {/* =========================
          TIMER DISPLAY
      ========================= */}
      <p className="mb-4 text-4xl font-bold text-center">
        {formatTime(seconds)}
      </p>

      {/* =========================
          CONTROLS
      ========================= */}
      <div className="flex justify-center gap-4">
        {!running ? (
          <button
            onClick={startTimer}
            className="px-4 py-2 transition bg-white/20 rounded-xl hover:bg-white/30"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="px-4 py-2 transition bg-white/20 rounded-xl hover:bg-white/30"
          >
            Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="px-4 py-2 transition bg-white/20 rounded-xl hover:bg-white/30"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FocusTimerCard;