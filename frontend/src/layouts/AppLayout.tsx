import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)] ">

      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1">

        {/* NAVBAR */}
        <TopNavbar />

        {/* MAIN CONTENT AREA */}
        <main className="relative flex-1 overflow-hidden custom-scrollbar pr-1">

          {/* Global Background Shapes */}
          <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
          <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px] pointer-events-none"></div>

          {/* Scrollable Page Content */}
          <div className="relative z-10 h-full overflow-y-auto">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
};

export default AppLayout;