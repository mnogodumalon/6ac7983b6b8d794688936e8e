import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { IconAlertTriangle, IconClock, IconPlus, IconStarFilled } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { Testeintraege } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { tx } from '@/i18n';
import { gruss, namen, undoToast, useClock } from '@/lib/polish';
import { Button } from '@/components/ui/button';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { KanbanWidget, type KanbanCard, type KanbanColumn } from '@/components/widgets/KanbanWidget';

const NEXT: Record<string, string | undefined> = {
  offen: 'in_bearbeitung',
  in_bearbeitung: 'erledigt',
};

type Filter = 'all' | 'wichtig' | 'ueberfaellig';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { testeintraege, setTesteintraege, fetchAll } = data;
  const clock = useClock();
  const [filter, setFilter] = useState<Filter>('all');

  const advance = (r: Testeintraege) => {
    const cur = lookupKey(r.fields.status) ?? 'offen';
    const next = NEXT[cur];
    if (!next) return;
    const prev = r.fields.status;
    const patch = (value: Testeintraege['fields']['status']) =>
      setTesteintraege(list => list.map(x => (x.record_id === r.record_id ? { ...x, fields: { ...x.fields, status: value } } : x)));
    patch(lookupOption('testeintraege', 'status', next));
    LivingAppsService.updateTesteintraegeEntry(r.record_id, { status: next }).catch(() => fetchAll());
    const title = r.fields.titel ?? tx('Eintrag');
    undoToast(tx`${title} — weitergeschoben`, () => {
      patch(prev);
      LivingAppsService.updateTesteintraegeEntry(r.record_id, { status: cur }).catch(() => fetchAll());
    });
  };

  const crud = useEntityCrud(data, {
    footer: top => {
      if (top.type !== 'testeintraege') return undefined;
      const rec = top.record;
      if (!NEXT[lookupKey(rec.fields.status) ?? 'offen']) return undefined;
      return { label: tx('Nächster Schritt'), onClick: () => advance(rec) };
    },
  });

  const today = format(clock, 'yyyy-MM-dd');
  const isOpen = (r: Testeintraege) => lookupKey(r.fields.status) !== 'erledigt';
  const isOverdue = (r: Testeintraege) => isOpen(r) && !!r.fields.testdatum && r.fields.testdatum.slice(0, 10) < today;

  const wichtigOffen = useMemo(() => testeintraege.filter(r => r.fields.wichtig && isOpen(r)), [testeintraege]);
  const ueberfaellig = useMemo(() => testeintraege.filter(isOverdue), [testeintraege, today]);
  const naechste = useMemo(
    () =>
      testeintraege
        .filter(r => isOpen(r) && !!r.fields.testdatum)
        .sort((a, b) => (a.fields.testdatum ?? '').localeCompare(b.fields.testdatum ?? '')),
    [testeintraege],
  );

  const columns: KanbanColumn[] = (LOOKUP_OPTIONS['testeintraege']?.['status'] ?? []).map(o => ({ key: o.key, label: o.label }));

  const visible = testeintraege.filter(r =>
    filter === 'wichtig' ? r.fields.wichtig && isOpen(r) : filter === 'ueberfaellig' ? isOverdue(r) : true,
  );

  const cards: KanbanCard[] = visible
    .slice()
    .sort((a, b) => (a.fields.testdatum ?? '9999').localeCompare(b.fields.testdatum ?? '9999'))
    .map(r => {
      const name = [r.fields.vorname, r.fields.nachname].filter(Boolean).join(' ');
      const sub = [name, r.fields.testdatum ? formatDate(r.fields.testdatum) : ''].filter(Boolean).join(' · ');
      return {
        id: `testeintrag:${r.record_id}`,
        column: lookupKey(r.fields.status) ?? columns[0]?.key ?? '',
        title: (
          <span className="flex items-center gap-1.5 min-w-0">
            {r.fields.wichtig && <IconStarFilled size={14} className="shrink-0 text-amber-500" />}
            <span className="truncate">{r.fields.titel ?? tx('Ohne Titel')}</span>
          </span>
        ),
        subtitle: sub || undefined,
        tone: r.fields.wichtig ? ('warning' as const) : ('default' as const),
      };
    });

  const moveCard = (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    const rec = testeintraege.find(x => x.record_id === rid);
    if (!rec) return;
    const prev = rec.fields.status;
    const prevKey = lookupKey(prev);
    const patch = (value: Testeintraege['fields']['status']) =>
      setTesteintraege(list => list.map(x => (x.record_id === rid ? { ...x, fields: { ...x.fields, status: value } } : x)));
    patch(lookupOption('testeintraege', 'status', newColumn));
    LivingAppsService.updateTesteintraegeEntry(rid, { status: newColumn }).catch(() => fetchAll());
    const title = rec.fields.titel ?? tx('Eintrag');
    undoToast(tx`${title} — Status geändert`, () => {
      patch(prev);
      LivingAppsService.updateTesteintraegeEntry(rid, prevKey ? { status: prevKey } : {}).catch(() => fetchAll());
    });
  };

  const rowAction = (r: Testeintraege) =>
    NEXT[lookupKey(r.fields.status) ?? 'offen'] ? { label: tx('Weiter'), onClick: () => advance(r) } : undefined;

  const openRec = (id: string) => {
    const rec = testeintraege.find(x => x.record_id === id);
    if (rec) crud.testeintraege.openDetail(rec);
  };

  const rowItem = (r: Testeintraege, second: React.ReactNode) => ({
    id: r.record_id,
    title: r.fields.titel ?? tx('Ohne Titel'),
    secondLine: second,
    action: rowAction(r),
  });

  const offenCount = testeintraege.filter(isOpen).length;
  const context = (() => {
    if (testeintraege.length === 0) return tx('Lege deinen ersten Testeintrag an.');
    if (wichtigOffen.length > 0) {
      const names = namen(wichtigOffen.map(r => r.fields.titel ?? ''));
      return tx`Wichtig und noch offen: ${names}.`;
    }
    if (naechste.length > 0) {
      const first = naechste[0].fields.titel ?? '';
      return tx`Als Nächstes dran: ${first}.`;
    }
    return tx`Alle ${testeintraege.length} Testeinträge sind erledigt.`;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        {crud.testeintraege.canWrite && (
          <Button onClick={() => crud.testeintraege.openCreate({ status: 'offen' })}>
            <IconPlus size={16} className="shrink-0" />
            {tx('Neuer Testeintrag')}
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Wichtig & offen')}
              value={wichtigOffen.length}
              icon={<IconStarFilled size={16} className="text-muted-foreground" />}
              tone={wichtigOffen.length > 0 ? 'warning' : 'default'}
              onClick={() => setFilter(f => (f === 'wichtig' ? 'all' : 'wichtig'))}
              active={filter === 'wichtig'}
            />
            <StatStripItem
              title={tx('Überfällig')}
              value={ueberfaellig.length}
              icon={<IconAlertTriangle size={16} className="text-muted-foreground" />}
              tone={ueberfaellig.length > 0 ? 'destructive' : 'default'}
              onClick={() => setFilter(f => (f === 'ueberfaellig' ? 'all' : 'ueberfaellig'))}
              active={filter === 'ueberfaellig'}
            />
            <StatStripItem
              title={tx('Noch nicht erledigt')}
              value={`${offenCount}/${testeintraege.length}`}
              icon={<IconClock size={16} className="text-muted-foreground" />}
            />
          </StatStrip>
        }
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['erledigt']}
            onCardClick={card => openRec(card.id.split(':')[1] ?? '')}
            onCardMove={moveCard}
            onAddCard={column => crud.testeintraege.openCreate({ status: column })}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Wichtig im Blick')}
              items={wichtigOffen.map(r =>
                rowItem(
                  r,
                  <span className="text-muted-foreground">
                    <span className="font-medium text-amber-600">{r.fields.status?.label}</span>
                    {r.fields.testdatum ? ` · ${formatDate(r.fields.testdatum)}` : ''}
                  </span>,
                ),
              )}
              onItemClick={openRec}
              empty={{
                text: tx('Nichts Wichtiges offen.'),
                action: crud.testeintraege.canWrite
                  ? { label: tx('Neuer Testeintrag'), onClick: () => crud.testeintraege.openCreate({ wichtig: true, status: 'offen' }) }
                  : undefined,
              }}
            />
            <WorkList
              title={tx('Als Nächstes fällig')}
              items={naechste.slice(0, 6).map(r =>
                rowItem(
                  r,
                  <span className="text-muted-foreground">
                    {isOverdue(r) ? <span className="font-medium text-destructive">{tx('Überfällig')}</span> : r.fields.status?.label}
                    {` · ${formatDate(r.fields.testdatum)}`}
                  </span>,
                ),
              )}
              onItemClick={openRec}
              empty={{ text: tx('Keine Termine in Sicht.') }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
