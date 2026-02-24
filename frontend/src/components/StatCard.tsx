interface StatCardProps {
    title: string;
    value?: number;
    color?: string;
}

const StatCard = ({ title, value = 0, color = "text-white" }: StatCardProps) => {
    return (
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition duration-300 h-full flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className={`text-3xl font-bold ${color}`}>
                {value}
            </p>
        </div>
    );
};

export default StatCard;