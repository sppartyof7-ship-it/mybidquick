import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '16px 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container" style={{ maxWidth: 800, padding: '60px 20px 80px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 48 }}>Last updated: April 9, 2026</p>

        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 16 }}>
          <Section title="1. Acceptance of Terms">
            By accessing or using MyBidQuick ("the Service"), operated by MyBidQuick ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </Section>

          <Section title="2. Description of Service">
            MyBidQuick is a white-label instant quoting platform designed for cleaning companies. Tenants (cleaning company subscribers) receive a branded quote page where their customers can request cleaning service quotes. The platform includes lead capture, CRM tools, and automated follow-up features.
          </Section>

          <Section title="3. Account Registration">
            To use MyBidQuick as a tenant, you must create an account with accurate and complete information. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old and have the authority to bind your business to these terms. You agree to notify us immediately of any unauthorized use of your account.
          </Section>

          <Section title="4. Billing and Credits">
            MyBidQuick operates on a per-lead credit billing model. Each quote submission by an end customer deducts one credit from the tenant's account. Credit packs are purchased in advance through our payment processor, Stripe. All purchases are final. Credits do not expire. Pricing is subject to change with 30 days' notice to active tenants. New accounts receive complimentary credits as described on our pricing page.
          </Section>

          <Section title="5. Tenant Responsibilities">
            As a tenant, you agree to: use the Service only for legitimate business purposes; not misrepresent your business, pricing, or services to end customers; not use the platform to collect data for purposes other than providing cleaning service quotes; comply with all applicable laws, including data protection regulations; and maintain accurate business and contact information in your account.
          </Section>

          <Section title="6. End Customer Data">
            Quote submissions generate lead data (name, email, phone, address, service selections) that is shared with the relevant tenant. Tenants are responsible for their own use of customer data in compliance with applicable privacy laws. MyBidQuick processes end customer data on behalf of tenants and in accordance with our Privacy Policy.
          </Section>

          <Section title="7. White-Label Branding">
            Tenants may customize their quote page with their business name, logo, and brand colors. Tenants may not remove MyBidQuick attribution where required. Tenants may not misrepresent MyBidQuick as their own proprietary software. All white-label customizations must comply with applicable trademark laws.
          </Section>

          <Section title="8. Intellectual Property">
            The MyBidQuick platform, including its design, code, features, and branding, is the intellectual property of MyBidQuick. Tenants retain ownership of their business data and customer leads. You may not copy, modify, reverse-engineer, or redistribute any part of the platform without written permission.
          </Section>

          <Section title="9. Service Availability">
            We strive to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or modifications to the platform at any time. We are not liable for any loss of business or data resulting from temporary service disruptions.
          </Section>

          <Section title="10. Limitation of Liability">
            To the maximum extent permitted by law, MyBidQuick shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you have paid to MyBidQuick in the 12 months preceding the claim. MyBidQuick does not guarantee any specific business results, lead volume, or revenue from using the platform.
          </Section>

          <Section title="11. Termination">
            We may suspend or terminate your account if you violate these terms, engage in fraudulent activity, or fail to maintain an active credit balance for an extended period. You may cancel your account at any time by contacting us. Upon termination, your access to the platform will cease, but we may retain data as required by law.
          </Section>

          <Section title="12. Dispute Resolution">
            Any disputes arising from these terms shall be governed by the laws of the State of Wisconsin. Both parties agree to attempt good-faith resolution before pursuing legal action. Any legal proceedings shall be conducted in the courts of Wisconsin.
          </Section>

          <Section title="13. Changes to Terms">
            We may update these Terms of Service at any time. We will notify active tenants of material changes via email. Continued use of the Service after changes constitutes acceptance of the updated terms.
          </Section>

          <Section title="14. Contact">
            For questions about these Terms of Service, contact us at:<br /><br />
            MyBidQuick<br />
            Email: tim@mybidquick.com<br />
            Website: www.mybidquick.com
          </Section>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-dark)', color: 'rgba(255,255,255,0.5)',
        padding: '40px 0', textAlign: 'center', fontSize: 14,
      }}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} MyBidQuick. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{title}</h2>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  )
}
