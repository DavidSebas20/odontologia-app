import { FaTooth } from "react-icons/fa";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/15 mb-4">
            <FaTooth className="text-white" size={45} />
          </div>
          <h2 className="text-white font-bold text-3xl">Clínica Dental</h2>
        </div>
        {children}
      </div>
    </main>
  );
}
