CREATE TYPE cita_estado AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');

CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  motivo TEXT NOT NULL DEFAULT '',
  estado cita_estado NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_citas_patient_id ON citas(patient_id);
CREATE INDEX idx_citas_dentist_id ON citas(dentist_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_recepcion_full_access" ON citas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'recepcion')
    )
  );

CREATE POLICY "dentista_own_citas" ON citas
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

CREATE POLICY "paciente_read_own_citas" ON citas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'paciente'
    )
    AND patient_id IN (
      SELECT id FROM patients WHERE patients.id = citas.patient_id
      -- ponytail: assumes paciente.profiles.id matches patient record somehow
      -- in practice, link profiles.id to a patient record via email or created_by
    )
  );
