import Navbar from "./Navbar";

export function PageLayout({ children, userType, hideNavbar }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {!hideNavbar && <Navbar userType={userType} />}
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
