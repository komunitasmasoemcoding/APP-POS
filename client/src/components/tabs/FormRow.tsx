import type React from 'react';
import { Field, FieldLabel } from '@/components/ui/field';

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Field className="mb-3 gap-1.5">
    <FieldLabel>{label}</FieldLabel>
    {children}
  </Field>
);

export default FormRow;
