import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-x-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1 min-h-0">

        {/* NAVBAR */}
        <TopNavbar />

        {/* MAIN CONTENT AREA */}
        <main className="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto custom-scrollbar">

          {/* BACKGROUND */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
            <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>
          </div>

          {/* Page Content */}
          <div className="relative z-10 h-full">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
};

export default AppLayout;