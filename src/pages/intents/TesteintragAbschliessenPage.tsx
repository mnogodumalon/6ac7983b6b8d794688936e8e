/**
 * Testeintrag abschließen — 2-Schritt-Wizard.
 * Steps: 1) Offenen Testeintrag wählen → 2) Abschluss bestätigen (Status wird auf „Erledigt“ gesetzt).
 * Reads: testeintraege. Writes: testeintraege (status = erledigt, via useTesteintragAbschliessenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldDate } from '@/lib/journey';
import { useTesteintragAbschliessenFlow } from '@/lib/journey/flows/TesteintragAbschliessen';
import { optionsOf } from '@/lib/journey';
import { tx } from '@/i18n';

export default function TesteintragAbschliessenPage() {
  const [step, setStep] = useState(1);
  const flow = useTesteintragAbschliessenFlow({
    steps: { testeintraege: 1 },
    items: {
      testeintraege: r => {
        const datum = fieldDate(r, 'testdatum');
        return {
          id: r.id,
          title: fieldText(r, 'titel') || tx('Ohne Titel'),
          subtitle: datum ? tx`Testdatum: ${datum}` : undefined,
          status: fieldLookup(r, 'status') ?? undefined,
        };
      },
    },
  });

  const erledigtLabel = optionsOf('testeintraege', 'status').find(o => o.key === 'erledigt')?.label ?? '';
  const primary = flow.submit.result?.primary;
  const facts = primary
    ? [
        { label: tx('Titel'), value: fieldText(primary, 'titel') || '—' },
        { label: tx('Status'), value: fieldLookup(primary, 'status')?.label ?? erledigtLabel },
      ]
    : undefined;

  return (
    <IntentWizardShell
      title={tx('Testeintrag abschließen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{ description: tx('Einen offenen Testeintrag auswählen und auf „Erledigt“ setzen.'), needs: [tx('Den Titel des Testeintrags')] }}
    >
      <WizardStep label={tx('Testeintrag')} description={tx('Welcher Testeintrag ist fertig?')}>
        <EntitySelectStep
          {...flow.picks.testeintraege.select}
          {...flow.pick('testeintraege')}
          searchPlaceholder={tx('Titel suchen …')}
          emptyText={tx('Es gibt keinen Testeintrag zum Abschließen.')}
        />
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            confirmLabel={tx('Auf „Erledigt“ setzen')}
            items={[{ key: 'status', label: tx('Neuer Status'), value: erledigtLabel }]}
            whatHappensNext={tx('Der Testeintrag wird sofort als erledigt markiert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          facts={facts}
          actions={{ copy: false, print: false }}
          next={[
            { label: tx('Testeintrag anlegen'), href: '#/intents/testeintrag-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
