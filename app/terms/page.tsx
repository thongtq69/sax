import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - James Sax Corner',
  description: 'Terms of Service and conditions for purchasing professional saxophones from James Sax Corner. Read our policies on shipping, returns, and customer protection.',
  alternates: {
    canonical: 'https://jamessaxcorner.com/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using James Sax Corner website and services, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Products and Services</h2>
          <p>
            James Sax Corner specializes in professional-grade saxophones and wind instruments. All products are professionally maintained and prepared before shipping.
          </p>

          <h2>3. Pricing and Payment</h2>
          <ul>
            <li>All prices are listed in USD</li>
            <li>Payments are processed securely through PayPal</li>
            <li>Prices are subject to change without notice</li>
            <li>Additional shipping and handling charges may apply</li>
          </ul>

          <h2>4. Shipping and Delivery</h2>
          <ul>
            <li>We ship worldwide using FedEx, DHL, and UPS express services</li>
            <li>Shipping costs are calculated based on destination and service level</li>
            <li>Delivery times vary by location and shipping method</li>
            <li>Risk of loss transfers to buyer upon delivery to carrier</li>
          </ul>

          <h2>5. Returns and Exchanges</h2>
          <p>
            Due to the complexity and high cost of international logistics, we do not accept returns. Every saxophone is professionally prepared and inspected before shipping to ensure quality.
          </p>

          <h2>6. Warranty</h2>
          <p>
            All instruments are sold as-is with detailed condition descriptions. We provide accurate representations of each instrument's condition and specifications.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            James Sax Corner shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or services.
          </p>

          <h2>8. Privacy Policy</h2>
          <p>
            Your privacy is important to us. We collect and use personal information only as necessary to provide our services and process orders.
          </p>

          <h2>9. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at info@jamessaxcorner.com
          </p>
        </div>
      </div>
    </div>
  )
}