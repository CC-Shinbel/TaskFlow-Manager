import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Task {
    id: number;
    title: string;
    due_date?: string;
}

const CalendarCard = ({ tasks }: { tasks: Task[] }) => {
    const navigate = useNavigate();

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // =========================
    // VALID TASKS
    // =========================
    const validTasks = useMemo(() => {
        return tasks.filter(task => task.due_date);
    }, [tasks]);

    // =========================
    // GROUP TASKS
    // =========================
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};

        validTasks.forEach((task) => {
            const key = task.due_date as string;

            if (!map[key]) {
                map[key] = [];
            }

            map[key].push(task);
        });

        return map;
    }, [validTasks]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setActiveDropdown(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setActiveDropdown(null);
    };

    const formatDateKey = (day: number) => {
        const monthFormatted = String(month + 1).padStart(2, "0");
        const dayFormatted = String(day).padStart(2, "0");
        return `${year}-${monthFormatted}-${dayFormatted}`;
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="flex flex-col p-6 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl min-h-[420px]">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30"
                >
                    ◀
                </button>

                <h3 className="text-lg font-semibold">
                    {currentDate.toLocaleString("default", {
                        month: "long",
                    })}{" "}
                    {year}
                </h3>

                <button
                    onClick={handleNextMonth}
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30"
                >
                    ▶
                </button>
            </div>

            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 mb-2 text-xs opacity-70">
                {weekDays.map((day) => (
                    <div key={day} className="text-center">
                        {day}
                    </div>
                ))}
            </div>

            {/* =========================
                GRID CONTAINER (FIXED SPACE)
            ========================= */}
            <div className="flex-1">

                <div className="grid grid-cols-7 gap-2 text-sm">

                    {/* EMPTY CELLS */}
                    {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                        <div key={`empty-${index}`} />
                    ))}

                    {/* DAYS */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dateKey = formatDateKey(day);
                        const dayTasks = tasksByDate[dateKey];

                        return (
                            <div key={day} className="relative">

                                <div
                                    onClick={() => {
                                        if (!dayTasks) return;

                                        if (dayTasks.length === 1) {
                                            navigate(`/tasks/${dayTasks[0].id}`);
                                        } else {
                                            setActiveDropdown(
                                                activeDropdown === dateKey ? null : dateKey
                                            );
                                        }
                                    }}
                                    className={`relative p-2 rounded-xl text-center cursor-pointer transition
                                    ${dayTasks
                                            ? "bg-[#ebca85]/40 hover:bg-[#ebca85]/60"
                                            : "hover:bg-white/20"
                                        }`}
                                >
                                    {day}

                                    {dayTasks && (
                                        <span className="absolute top-1 right-1 text-[10px] bg-[#b13535] text-white rounded-full px-1">
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>

                                {/* DROPDOWN */}
                                {activeDropdown === dateKey && dayTasks && dayTasks.length > 1 && (
                                    <div className="absolute z-50 p-2 mt-2 space-y-1 text-black shadow-xl w-44 backdrop-blur-xl bg-white/90 rounded-xl">
                                        {dayTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() =>
                                                    navigate(`/tasks/${task.id}`)
                                                }
                                                className="block w-full px-2 py-1 text-sm text-left truncate rounded-lg hover:bg-gray-200"
                                            >
                                                {task.title}
                                            </button>
                                        ))}
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EMPTY STATE */}
            {validTasks.length === 0 && (
                <p className="mt-4 text-xs opacity-70">
                    No deadlines for this month.
                </p>
            )}
        </div>
    );
};

export default CalendarCard;