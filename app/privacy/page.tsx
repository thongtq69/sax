import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - James Sax Corner',
  description: 'Privacy Policy for James Sax Corner. Learn how we collect, use, and protect your personal information when you shop for professional saxophones.',
  alternates: {
    canonical: 'https://jamessaxcorner.com/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li>Name, email address, and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through PayPal)</li>
            <li>Product inquiries and communications</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about products and services</li>
            <li>Provide customer support</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties except:
          </p>
          <ul>
            <li>To shipping carriers for order fulfillment</li>
            <li>To payment processors (PayPal) for transaction processing</li>
            <li>When required by law or to protect our rights</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and understand user preferences.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>Our website may use third-party services including:</p>
          <ul>
            <li>Google Analytics for website analytics</li>
            <li>PayPal for payment processing</li>
            <li>Shipping carriers for order tracking</li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>8. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at info@jamessaxcorner.com
          </p>
        </div>
      </div>
    </div>
  )
}