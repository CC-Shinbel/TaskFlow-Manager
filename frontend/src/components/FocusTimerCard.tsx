import { useEffect, useRef, useState } from "react";

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

    // Update timer when technique changes
    useEffect(() => {
        if (technique !== "custom") {
            setSeconds(techniqueDurations[technique]);
            setRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [technique]);

    const startTimer = () => {
        if (running) return;

        setRunning(true);

        intervalRef.current = window.setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
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
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
    };

    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
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
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white h-full flex flex-col">

            <h3 className="text-lg font-semibold mb-4">
                Focus Timer
            </h3>

            {/* Technique Dropdown */}
            <div className="mb-4">
                <select
                    value={technique}
                    onChange={(e) =>
                        setTechnique(e.target.value as Technique)
                    }
                    className="w-full px-4 py-2 rounded-xl bg-white/70 text-black border border-white/30 focus:outline-none"
                >
                    {Object.entries(techniqueLabels).map(
                        ([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        )
                    )}
                </select>
            </div>

            {/* Custom Input */}
            {technique === "custom" && (
                <div className="mb-4 flex gap-2">
                    <input
                        type="number"
                        min="1"
                        value={customMinutes}
                        onChange={(e) =>
                            setCustomMinutes(Number(e.target.value))
                        }
                        className="flex-1 px-4 py-2 rounded-xl bg-white/70 text-black border border-white/30"
                        placeholder="Minutes"
                    />
                    <button
                        onClick={applyCustomTime}
                        className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30"
                    >
                        Set
                    </button>
                </div>
            )}

            {/* Timer Display */}
            <p className="text-4xl font-bold mb-4 text-center">
                {formatTime(seconds)}
            </p>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                {!running ? (
                    <button
                        onClick={startTimer}
                        className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30"
                    >
                        Start
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30"
                    >
                        Pause
                    </button>
                )}

                <button
                    onClick={resetTimer}
                    className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default FocusTimerCard;