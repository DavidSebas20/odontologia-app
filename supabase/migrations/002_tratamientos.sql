CREATE TABLE tratamientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT current_date,
  diagnostico TEXT NOT NULL,
  procedimiento_realizado TEXT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tratamientos_patient_id ON tratamientos(patient_id);
CREATE INDEX idx_tratamientos_dentist_id ON tratamientos(dentist_id);
CREATE INDEX idx_tratamientos_cita_id ON tratamientos(cita_id);
CREATE INDEX idx_tratamientos_fecha ON tratamientos(fecha);

ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_recepcion_full_access" ON tratamientos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'recepcion')
    )
  );

CREATE POLICY "dentista_own_tratamientos" ON tratamientos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'dentista'
    )
    AND dentist_id = auth.uid()
  );

CREATE POLICY "paciente_read_own_tratamientos" ON tratamientos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'paciente'
    )
  );
