import PublicShell from '../components/marketing/PublicShell';

const UPDATED = 'August 2026';

const PRIVACY = [
  ['Overview', 'This Privacy Policy explains what information CodeViz collects, how we use it, and your choices. By using CodeViz you agree to this policy.'],
  ['Information we collect', 'Account details you provide (name, email), content you create (code, submissions, shared visualizations), and usage data (executions, AI calls, pages visited) used to operate and improve the service.'],
  ['How we use it', 'To provide the product, personalize learning, enforce plan limits, prevent abuse, process payments, and communicate with you. We do not sell your personal data.'],
  ['Code execution', 'Code you run is executed in an isolated, network-disabled sandbox and is not used to train models. Shared visualizations are public only when you explicitly create a share link.'],
  ['Third parties', 'We use service providers for hosting, payments (Razorpay), and AI features (e.g. Google Gemini, Groq). They process data only to provide their service.'],
  ['Data retention & security', 'We retain data while your account is active and apply reasonable safeguards. No method of transmission is 100% secure.'],
  ['Your rights', 'You can access, update, or delete your account data. Contact us to exercise these rights.'],
  ['Changes', 'We may update this policy; material changes will be posted here with a new date.'],
];

const TERMS = [
  ['Acceptance', 'By accessing or using CodeViz you agree to these Terms of Service. If you do not agree, do not use the service.'],
  ['Accounts', 'You are responsible for your account and for keeping your credentials secure. You must provide accurate information and be old enough to form a binding contract.'],
  ['Acceptable use', 'Do not misuse the sandbox (no attacks, mining, or attempts to break isolation), infringe others’ rights, or disrupt the service. We may suspend accounts that violate these terms.'],
  ['Plans & billing', 'Paid plans renew until cancelled. Fees are billed via Razorpay. You can cancel anytime and keep access until the end of the current period. Usage limits apply per plan.'],
  ['Content & IP', 'You own the code and content you create. By creating a public share you grant us a license to display it. CodeViz and its branding are our property.'],
  ['Disclaimer', 'The service is provided “as is” without warranties. We are not liable for indirect or incidental damages to the extent permitted by law.'],
  ['Termination', 'You may stop using the service at any time. We may suspend or terminate access for violations of these terms.'],
  ['Contact', 'Questions about these terms? Reach us via the Contact page.'],
];

function Doc({ title, sections }) {
  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 py-14" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <h1 className="text-[34px] font-extrabold tracking-tight m-0">{title}</h1>
        <p className="text-muted text-[13px] mt-1 mb-8">Last updated: {UPDATED}</p>
        <div className="flex flex-col gap-7">
          {sections.map(([h, body], i) => (
            <section key={h}>
              <h2 className="text-[16px] font-bold m-0 mb-2">{i + 1}. {h}</h2>
              <p className="text-[14px] text-muted leading-relaxed m-0">{body}</p>
            </section>
          ))}
        </div>
        <p className="text-[12px] text-faint mt-10">This document is a general template and not legal advice.</p>
      </div>
    </PublicShell>
  );
}

export function Privacy() { return <Doc title="Privacy Policy" sections={PRIVACY} />; }
export function Terms() { return <Doc title="Terms of Service" sections={TERMS} />; }
