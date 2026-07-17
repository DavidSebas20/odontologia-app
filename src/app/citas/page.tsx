import Link from "next/link";
import { getCitas } from "@/server/actions/citas";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import CitasTable from "./citas-table";

export default async function CitasPage() {
  const citas = await getCitas();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citas</h1>
        </div>
        <Link href="/citas/nueva">
          <Button>
            <FaPlus /> Nueva cita
          </Button>
        </Link>
      </div>

      <CitasTable citas={citas} />
    </div>
  );
}
