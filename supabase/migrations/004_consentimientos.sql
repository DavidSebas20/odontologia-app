CREATE TABLE consentimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tratamiento_id UUID REFERENCES tratamientos(id) ON DELETE SET NULL,
  tipo_consentimiento TEXT NOT NULL,
  contenido TEXT NOT NULL,
  firmado BOOLEAN NOT NULL DEFAULT false,
  fecha_firma TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consentimientos_patient_id ON consentimientos(patient_id);
CREATE INDEX idx_consentimientos_tratamiento_id ON consentimientos(tratamiento_id);

ALTER TABLE consentimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_recepcion_full_access" ON consentimientos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'recepcion')));

CREATE POLICY "dentista_own_consentimientos" ON consentimientos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'dentista'));

CREATE POLICY "paciente_read_own_consentimientos" ON consentimientos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'paciente'));
