import Sidebar from "../components/Sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)] overflow-hidden">

            <Sidebar />

            <div className="flex-1 relative z-10">
                {children}
            </div>

        </div>
    );
};

export default AppLayout;