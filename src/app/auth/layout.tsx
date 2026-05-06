import { FaTooth } from "react-icons/fa";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4 pb-24">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4 shadow-md">
            <FaTooth className="text-white" size={40} />
          </div>
          <h2 className="text-foreground font-bold text-3xl">Clínica Dental</h2>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-lg shadow-black/5">
          {children}
        </div>
      </div>
    </main>
  );
}
