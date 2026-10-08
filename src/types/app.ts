import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Testeintraege {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    testdatum?: string; // Format: YYYY-MM-DD oder ISO String
    anzahl?: number;
    status?: LookupValue;
    wichtig?: boolean;
  };
}

export const APP_IDS = {
  TESTEINTRAEGE: '6ac7982fc6aa82738ea2c858',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'testeintraege': {
    status: [{ key: "offen", get label() { return lookupLabel('testeintraege', 'status', "offen") ?? "Offen"; } }, { key: "in_bearbeitung", get label() { return lookupLabel('testeintraege', 'status', "in_bearbeitung") ?? "In Bearbeitung"; } }, { key: "erledigt", get label() { return lookupLabel('testeintraege', 'status', "erledigt") ?? "Erledigt"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'testeintraege': {
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'testdatum': 'date/date',
    'anzahl': 'number',
    'status': 'lookup/radio',
    'wichtig': 'bool',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateTesteintraege = StripLookup<Testeintraege['fields']>;