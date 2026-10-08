// Auto-generated. Per-entity form-enhancements config for "Testeinträge".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", {"row": ["vorname", "nachname"]}, "email", {"row": ["testdatum", "anzahl"], "cols": "1fr 1fr"}, "status", "wichtig", "beschreibung"],
  defaults: {
    'testdatum': { kind: 'today' },
    'anzahl': { kind: 'literal', value: 1 },
    'status': { kind: 'lookup', key: 'offen', label: 'Offen' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
