import type { Testeintraege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface TesteintraegeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Testeintraege;
}

export function TesteintraegeDetails({
  record,
}: TesteintraegeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('testeintraege', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('testeintraege', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('testeintraege', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('testeintraege', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('testeintraege', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('testeintraege', 'testdatum')} value={record.fields.testdatum} format="date" />
        <RecordField label={fieldLabel('testeintraege', 'anzahl')} value={record.fields.anzahl} format="text" />
        <RecordField label={fieldLabel('testeintraege', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('testeintraege', 'wichtig')} value={record.fields.wichtig} format="bool" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.TESTEINTRAEGE} recordId={record.record_id} readOnly={!perms.canWrite('testeintraege')} />
    </>
  );
}
