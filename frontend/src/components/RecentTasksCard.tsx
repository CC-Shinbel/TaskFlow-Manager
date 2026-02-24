interface Task {
    id: number;
    title: string;
    due_date: string;
}

const RecentTasksCard = ({ tasks }: { tasks: Task[] }) => {
    return (
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>

            {tasks.length === 0 ? (
                <p className="opacity-70">No recent tasks.</p>
            ) : (
                <ul className="space-y-3">
                    {tasks.map(task => (
                        <li
                            key={task.id}
                            className="flex justify-between text-sm bg-white/10 p-3 rounded-xl"
                        >
                            <span>{task.title}</span>
                            <span className="opacity-70">{task.due_date}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecentTasksCard;