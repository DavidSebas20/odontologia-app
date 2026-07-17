DO $$ BEGIN
  CREATE TYPE factura_estado AS ENUM ('pendiente', 'pagado', 'parcial', 'anulado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tratamiento_id UUID REFERENCES tratamientos(id) ON DELETE SET NULL,
  monto_total NUMERIC(10,2) NOT NULL,
  estado factura_estado NOT NULL DEFAULT 'pendiente',
  fecha_emision DATE NOT NULL DEFAULT current_date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_facturas_patient_id ON facturas(patient_id);
CREATE INDEX idx_facturas_tratamiento_id ON facturas(tratamiento_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  monto NUMERIC(10,2) NOT NULL,
  metodo_pago metodo_pago NOT NULL DEFAULT 'efectivo',
  fecha_pago DATE NOT NULL DEFAULT current_date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagos_factura_id ON pagos(factura_id);

ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_recepcion_full_facturas" ON facturas
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'recepcion')));

CREATE POLICY "dentista_read_facturas" ON facturas
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'dentista'));

CREATE POLICY "paciente_read_own_facturas" ON facturas
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'paciente'));

CREATE POLICY "admin_recepcion_full_pagos" ON pagos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'recepcion')));

CREATE POLICY "dentista_read_pagos" ON pagos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'dentista'));

CREATE POLICY "paciente_read_own_pagos" ON pagos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'paciente'));
