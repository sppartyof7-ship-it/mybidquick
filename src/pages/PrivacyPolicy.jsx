import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
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
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 48 }}>Last updated: April 9, 2026</p>

        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 16 }}>
          <Section title="1. Introduction">
            MyBidQuick ("we," "our," or "us") operates the mybidquick.com website and SaaS platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. By using MyBidQuick, you agree to the collection and use of information as described in this policy.
          </Section>

          <Section title="2. Information We Collect">
            <strong>Account Information:</strong> When you create an account, we collect your name, email address, business name, phone number, and billing information.
            <br /><br />
            <strong>Customer Quote Data:</strong> When end customers submit a quote through a tenant's branded page, we collect the customer's name, email, phone number, property address, and service selections. This data is processed on behalf of the tenant (cleaning company) who owns the branded quote page.
            <br /><br />
            <strong>Usage Data:</strong> We automatically collect information about how you interact with our platform, including pages visited, features used, quote volume, and device/browser information.
            <br /><br />
            <strong>Payment Information:</strong> Payments are processed through Stripe. We do not store your full credit card number on our servers. Stripe's privacy practices are governed by their own privacy policy.
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect to: provide, operate, and maintain the MyBidQuick platform; process transactions and send billing notifications; send lead notifications and follow-up communications on behalf of tenants; improve and personalize user experience; analyze usage to improve our services; communicate with you about updates, features, and support; and comply with legal obligations.
          </Section>

          <Section title="4. Data Sharing and Disclosure">
            We do not sell your personal information. We may share information with: service providers who help us operate the platform (Stripe for payments, Supabase for data hosting, Vercel for website hosting, Google for address lookup services); tenant businesses, who receive their own customers' quote submissions and lead data; and law enforcement or government authorities if required by law.
          </Section>

          <Section title="5. Data Retention">
            We retain your account information as long as your account is active. Quote and lead data is retained on behalf of tenants in accordance with their needs. You may request deletion of your data by contacting us at tim@mybidquick.com.
          </Section>

          <Section title="6. Data Security">
            We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), row-level security policies on our database, secure authentication, and regular security reviews. However, no method of transmission over the Internet is 100% secure.
          </Section>

          <Section title="7. Cookies">
            We use essential cookies to keep you logged in and maintain your session. We do not use third-party advertising cookies. We may use analytics tools to understand how our site is used.
          </Section>

          <Section title="8. Third-Party Services">
            Our platform integrates with third-party services including Google Maps API (for address autocomplete), Stripe (for payment processing), and email services (for lead notifications). Each of these services has its own privacy policy governing their use of data.
          </Section>

          <Section title="9. Children's Privacy">
            MyBidQuick is a business-to-business platform and is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children.
          </Section>

          <Section title="10. Your Rights">
            Depending on your location, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; opt out of marketing communications; and request a copy of your data in a portable format. To exercise any of these rights, contact us at tim@mybidquick.com.
          </Section>

          <Section title="11. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the platform after changes constitutes acceptance of the revised policy.
          </Section>

          <Section title="12. Contact Us">
            If you have questions about this Privacy Policy, please contact us at:<br /><br />
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
