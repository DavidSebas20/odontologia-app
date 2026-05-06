import Link from "next/link";
import { getPatients } from "@/server/actions/patients";
import { Button } from "@/components/ui/button";
import PatientsTable from "./patients-table";
import { FaPlus } from "react-icons/fa6";

export default async function PacientesPage() {
  const { data: patients, error } = await getPatients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
        </div>
        <Link href="/pacientes/nuevo">
          <Button>
            <FaPlus /> Nuevo paciente
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      <PatientsTable patients={patients} />
    </div>
  );
}
