import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-x-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* NAVBAR */}
        <TopNavbar />

        {/* MAIN CONTENT AREA */}
        <main className="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto custom-scrollbar">

          {/* Background */}
          <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
          <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px] pointer-events-none"></div>

          {/* Page Content */}
          <div className="relative z-10">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
};

export default AppLayout;