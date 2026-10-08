/**
 * Testeintrag anlegen — 4-Schritt-Wizard.
 * Steps: 1) Titel & Beschreibung → 2) Kontaktdaten → 3) Datum, Anzahl & Wichtig → 4) Prüfen & anlegen.
 * Reads: –. Writes: testeintraege (Status wird vom System auf „Offen“ gesetzt).
 * Composes: IntentWizardShell, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useTesteintragAnlegenFlow } from '@/lib/journey/flows/TesteintragAnlegen';
import { tx } from '@/i18n';

export default function TesteintragAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useTesteintragAnlegenFlow({
    steps: { titel: 1, beschreibung: 1, vorname: 2, nachname: 2, email: 2, testdatum: 3, anzahl: 3, wichtig: 3 },
  });
  const form = flow.forms.testeintraege;

  return (
    <IntentWizardShell
      title={tx('Testeintrag anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Erfasse einen neuen Testeintrag mit Kontaktdaten, Datum und Anzahl.'),
        needs: [tx('Titel'), tx('Name und E-Mail-Adresse'), tx('Testdatum und Anzahl')],
      }}
    >
      <WizardStep label={tx('Titel')} description={tx('Gib dem Eintrag einen Titel und beschreibe ihn kurz.')}>
        <div className="space-y-4">
          <Bound form={form} name="titel" />
          <Bound form={form} name="beschreibung" rows={4} />
          <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Kontaktdaten')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Kontakt')} description={tx('Wer ist die Kontaktperson?')}>
        <div className="space-y-4">
          <Bound form={form} name="vorname" />
          <Bound form={form} name="nachname" />
          <Bound form={form} name="email" />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Datum und Anzahl')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Details')} description={tx('Wann findet der Test statt und wie viele sind es?')}>
        <div className="space-y-4">
          <Bound form={form} name="testdatum" />
          <Bound form={form} name="anzahl" />
          <Bound form={form} name="wichtig" />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Offen') }]}
            whatHappensNext={tx('Der Testeintrag wird mit dem Status „Offen“ angelegt.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Testeintrag abschließen'), href: '#/intents/testeintrag-abschliessen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
