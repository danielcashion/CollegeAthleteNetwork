"use client";
import { useState } from "react";
import Link from "next/link";
import { FaAngleDown } from "react-icons/fa6";

const TermsOfService = () => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white pb-12 pt-24 flex flex-col items-center px-[10%] sm:px-[20%]">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          The College Athlete Network
        </h1>
        <h1 className="text-4xl md:text-4xl font-bold mb-4 font-variant-small-caps">
          Our Terms of Service
        </h1>
      </div>

      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-white border border-gray-200 rounded p-4 mb-6">
          <div
            className="cursor-pointer font-semibold text-gray-800 text-2xl flex items-center justify-between"
            onClick={() => setShowTable(!showTable)}
          >
            Table of Contents
            <span
              className={`transform transition-transform ${
                showTable ? "rotate-180" : ""
              }`}
            >
              <FaAngleDown />
            </span>
          </div>

          {showTable && (
            <div className="mt-2 text-gray-700 space-y-1">
              <div>
                <Link
                  href="#using-our-service"
                  className="hover:underline block font-semibold"
                >
                  1. Using Our Service
                </Link>
                <div className="ml-6 space-y-1">
                  <Link href="#eligibility" className="hover:underline block">
                    1.1 Eligibility
                  </Link>
                  <Link href="#your-account" className="hover:underline block">
                    1.2 Your Account
                  </Link>
                  <Link
                    href="#license-to-use-the-service"
                    className="hover:underline block"
                  >
                    1.3 License to Use the Service
                  </Link>
                  <Link
                    href="#rules-for-using-the-service"
                    className="hover:underline block"
                  >
                    1.4 Rules for Using the Service
                  </Link>
                </div>
              </div>

              <div>
                <Link
                  href="#your-content"
                  className="hover:underline block font-semibold"
                >
                  2. Your Content
                </Link>
                <div className="ml-6 space-y-1">
                  <Link
                    href="#what-is-user-content"
                    className="hover:underline block"
                  >
                    2.1 What is User Content?
                  </Link>
                  <Link
                    href="#your-responsibilities"
                    className="hover:underline block"
                  >
                    2.2 Your Responsibilities
                  </Link>
                  <Link
                    href="#our-rights-to-your-content"
                    className="hover:underline block"
                  >
                    2.3 Our Rights to Your Content
                  </Link>
                  <Link
                    href="#dmca-copyright-policy"
                    className="hover:underline block"
                  >
                    2.4 DMCA Copyright Policy
                  </Link>
                </div>
              </div>

              <Link
                href="#privacy-and-data-security"
                className="hover:underline block font-semibold"
              >
                3. Privacy and Data Security
              </Link>

              <Link
                href="#mobile-apps"
                className="hover:underline block font-semibold"
              >
                4. Mobile Apps
              </Link>

              <Link
                href="#third-party-content-and-services"
                className="hover:underline block font-semibold"
              >
                5. Third-Party Content and Services
              </Link>

              <div>
                <Link
                  href="#paid-services-and-payments"
                  className="hover:underline block font-semibold"
                >
                  6. Paid Services and Payments
                </Link>
                <div className="ml-6 space-y-1">
                  <Link href="#paid-features" className="hover:underline block">
                    6.1 Paid Features
                  </Link>
                  <Link
                    href="#payments-to-organizations"
                    className="hover:underline block"
                  >
                    6.2 Payments to Organizations
                  </Link>
                  <Link
                    href="#payment-processing"
                    className="hover:underline block"
                  >
                    6.3 Payment Processing
                  </Link>
                </div>
              </div>

              <Link
                href="#background-screening"
                className="hover:underline block font-semibold"
              >
                7. Background Screening
              </Link>

              <Link
                href="#accessibility"
                className="hover:underline block font-semibold"
              >
                8. Accessibility
              </Link>

              <div>
                <Link
                  href="#intellectual-property"
                  className="hover:underline block font-semibold"
                >
                  9. Intellectual Property
                </Link>
                <div className="ml-6 space-y-1">
                  <Link href="#our-content" className="hover:underline block">
                    9.1 Our Content
                  </Link>
                  <Link href="#your-ideas" className="hover:underline block">
                    9.2 Your Ideas
                  </Link>
                  <Link href="#our-data" className="hover:underline block">
                    9.3 Our Data
                  </Link>
                </div>
              </div>

              <Link
                href="#no-warranty"
                className="hover:underline block font-semibold"
              >
                10. No Warranty
              </Link>

              <Link
                href="#limitation-of-liability"
                className="hover:underline block font-semibold"
              >
                11. Limitation of Liability
              </Link>

              <Link
                href="#indemnity"
                className="hover:underline block font-semibold"
              >
                12. Indemnity
              </Link>

              <div>
                <Link
                  href="#dispute-resolution"
                  className="hover:underline block font-semibold"
                >
                  13. Dispute Resolution
                </Link>
                <div className="ml-6 space-y-1">
                  <Link
                    href="#informal-resolution"
                    className="hover:underline block"
                  >
                    13.1 Informal Resolution
                  </Link>
                  <Link href="#arbitration" className="hover:underline block">
                    13.2 Arbitration
                  </Link>
                  <Link
                    href="#class-action-and-jury-trial-waiver"
                    className="hover:underline block"
                  >
                    13.3 Class Action and Jury Trial Waiver
                  </Link>
                </div>
              </div>

              <Link
                href="#governing-law"
                className="hover:underline block font-semibold"
              >
                14. Governing Law
              </Link>

              <div>
                <Link
                  href="#general-terms"
                  className="hover:underline block font-semibold"
                >
                  15. General Terms
                </Link>
                <div className="ml-6 space-y-1">
                  <Link href="#assignment" className="hover:underline block">
                    15.1 Assignment
                  </Link>
                  <Link href="#notifications" className="hover:underline block">
                    15.2 Notifications
                  </Link>
                  <Link
                    href="#entire-agreement"
                    className="hover:underline block"
                  >
                    15.3 Entire Agreement
                  </Link>
                  <Link href="#no-waiver" className="hover:underline block">
                    15.4 No Waiver
                  </Link>
                  <Link href="#contact" className="hover:underline block">
                    15.5 Contact
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 terms-of-service">
        <article className="prose prose-lg max-w-none text-gray-600">
          <p className="italic font-semibold mb-2">
            Last Updated: January 1st, 2025
          </p>

          <p className="mb-4 text-gray-600">
            Welcome to The College Athlete Network, LLC (“we,” “us,” or “The
            College Athlete Network”). These Terms and Conditions (“Terms”)
            govern your use of our website (
            <Link
              href="https://www.CollegeAthleteNetwork.org"
              className="text-blue-600 hover:underline"
            >
              www.CollegeAthleteNetwork.org
            </Link>
            ), any of our mobile apps, and all related services (collectively,
            the “Service”). By accessing or using the Service, you also agree to
            these Terms and our{" "}
            <Link
              href="https://www.CollegeAthleteNetwork.org/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
            . If you don&apos;t agree, please do not use the Service.
          </p>

          <p className="mb-4 text-gray-600">
            We may update these Terms from time to time. We&apos;ll notify you
            of significant changes via email or a website notice, and your
            continued use of the Service after such changes means you accept the
            updated Terms. Please review this page periodically.
          </p>

          <p className="font-semibold">Key Points to Understand</p>
          <ul className="list-disc list-inside mb-4">
            <li>You must be at least 13 years old to use the Service.</li>
            <li>
              Your data&apos;s security matters to us, and we&apos;ll never sell
              any of your data to any third parties.
            </li>
            <li>
              Disputes are resolved through arbitration, not court, and you
              waive the right to participate in class actions.
            </li>
            <li>
              You&apos;re responsible for the content you share, and we&apos;re
              not liable for third-party actions or content.
            </li>
          </ul>

          <h2
            id="using-our-service"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            1. Using Our Service
          </h2>

          <h3
            id="eligibility"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            1.1 Eligibility
          </h3>
          <p className="mb-4 text-gray-600">
            You must be at least 13 years old and able to enter into a legal
            contract to use the Service. The Service is not intended for
            children under 13, per the Children&apos;s Online Privacy Protection
            Act (COPPA). If we discover a user under 13, we&apos;ll delete their
            account and data. Users under 18 may need parental consent,
            especially if submitting personal information (e.g., roster data).
            If you represent an organization (e.g., a team, league, or
            association, referred to as an “Organization”), you confirm
            you&apos;re authorized to agree to these Terms on its behalf.
          </p>

          <h3
            id="your-account"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            1.2 Your Account
          </h3>
          <p className="mb-4 text-gray-600">
            To use certain features, you&apos;ll need a College Athlete Network
            account. When creating your account:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide accurate and complete information.</li>
            <li>
              Keep your password secure and don&apos;t share it. Use a strong
              password with a mix of letters, numbers, and symbols.
            </li>
            <li>
              Notify us immediately at{" "}
              <Link
                href="mailto:admin@CollegeAthleteNetwork.org"
                className="text-blue-600 hover:underline"
              >
                admin@CollegeAthleteNetwork.org
              </Link>{" "}
              if you suspect unauthorized use of your account.
            </li>
          </ul>
          <p className="mb-4 text-gray-600">
            We&apos;re not responsible for losses caused by unauthorized account
            use. You can manage your account settings, including email
            preferences, on your profile page. You&apos;ll receive
            Service-related emails (e.g., account updates), which you can&apos;t
            opt out of, but you can opt out of promotional emails in your
            settings.
          </p>

          <h3
            id="license-to-use-the-service"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            1.3 License to Use the Service
          </h3>
          <p className="mb-4 text-gray-600">
            We grant you a limited, non-exclusive, non-transferable, revocable
            license to use the Service for personal, non-commercial purposes
            (unless you&apos;re an Organization using it for permitted
            purposes). We reserve all rights not expressly granted.
          </p>

          <h3
            id="rules-for-using-the-service"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            1.4 Rules for Using the Service
          </h3>
          <p className="mb-4 text-gray-600">You agree not to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>
              Copy, distribute, or scrape any part of the Service without
              explicit permission.
            </li>
            <li>
              Use automated tools (e.g., bots, spiders) to access the Service,
              except for public search engines creating indices of publicly
              available content.
            </li>
            <li>Send spam, chain letters, or unsolicited emails.</li>
            <li>
              Interfere with the Service&apos;s security, integrity, or
              performance.
            </li>
            <li>Upload viruses, worms, or harmful code.</li>
            <li>
              Collect personal information from other users without consent.
            </li>
            <li>
              Use the Service for commercial solicitation (unless you&apos;re an
              authorized Organization).
            </li>
            <li>Impersonate anyone or misrepresent your identity.</li>
            <li>
              Bypass measures we use to restrict access or protect content.
            </li>
          </ul>
          <p className="mb-4 text-gray-600">
            We may change, limit, or discontinue the Service or your access at
            any time without notice, especially if you violate these Terms.
            You&apos;re responsible for your interactions with other users, and
            we&apos;re not liable for disputes between users.
          </p>

          <h2
            id="your-content"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            2. Your Content
          </h2>

          <h3
            id="what-is-user-content"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            2.1 What is User Content?
          </h3>
          <p className="mb-4 text-gray-600">
            “User Content” includes anything you post or submit to the Service,
            like profile details, roster information, photos, videos, or
            comments. You own your User Content, but by sharing it, you allow
            others to view or interact with it based on your privacy settings.
          </p>

          <h3
            id="your-responsibilities"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            2.2 Your Responsibilities
          </h3>
          <p className="mb-4 text-gray-600">
            You&apos;re responsible for ensuring your User Content:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Doesn&apos;t cause harm, injury, or distress to anyone.</li>
            <li>Doesn&apos;t exploit or endanger children.</li>
            <li>
              Isn&apos;t unlawful, offensive, defamatory, or invasive of
              privacy.
            </li>
            <li>
              Doesn&apos;t violate intellectual property rights or other laws.
            </li>
            <li>Is accurate and current.</li>
            <li>Complies with team, league, or other applicable policies.</li>
          </ul>

          <h3
            id="our-rights-to-your-content"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            2.3 Our Rights to Your Content
          </h3>
          <p className="mb-4 text-gray-600">
            By sharing User Content, you grant us a non-exclusive, worldwide,
            royalty-free license to use, display, modify, and share it as needed
            to operate and promote the Service, subject to your privacy
            settings. This license ends when you delete your content or account,
            except for content already shared publicly or with others. You also
            allow other users to view and interact with your User Content as
            permitted by the Service&apos;s features.
          </p>

          <h3
            id="dmca-copyright-policy"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            2.4 DMCA Copyright Policy
          </h3>
          <p className="mb-4 text-gray-600">
            We respect copyright laws and comply with the Digital Millennium
            Copyright Act (DMCA). If you believe your copyrighted work is
            infringed on the Service, send a written notice to our DMCA Agent:
          </p>
          <div className="border border-gray-200 p-4 rounded-lg mb-4">
            <p className="font-semibold">DMCA Agent</p>
            <p className="mb-4 text-gray-600">
              The College Athlete Network, LLC
            </p>
            <p className="mb-4 text-gray-600">
              One World Trade Center, Suite 8500
            </p>
            <p className="mb-4 text-gray-600">New York, NY 10007</p>
            <p className="mb-4 text-gray-600">Phone: 212-377-7030</p>
            <p className="mb-4 text-gray-600">
              Email:{" "}
              <Link
                href="mailto:info@CollegeAthleteNetwork.org"
                className="text-blue-600 hover:underline"
              >
                info@CollegeAthleteNetwork.org
              </Link>
            </p>
          </div>

          <h2
            id="privacy-and-data-security"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            3. Privacy and Data Security
          </h2>
          <p className="mb-4 text-gray-600">
            We care about your privacy. By using the Service, you consent to the
            collection, use, and sharing of your information as described in our{" "}
            <Link
              href="https://www.CollegeAthleteNetwork.org/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
            . Key points:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              We collect personal information like your name, email, and profile
              data to provide the Service.
            </li>
            <li>We don&apos;t sell your data to third parties.</li>
            <li>
              Organizations using the Service must comply with privacy laws and
              obtain your consent before collecting or sharing your data.
            </li>
            <li>
              If a data breach occurs, we&apos;ll notify affected users promptly
              as required by law.
            </li>
          </ul>
          <p className="mb-4 text-gray-600">
            You acknowledge that no security system is foolproof, and you
            provide your information at your own risk. If you&apos;re an
            Organization, you&apos;re responsible for securing user data you
            collect and complying with laws like the CCPA or GDPR.
          </p>

          <h2
            id="mobile-apps"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            4. Mobile Apps
          </h2>
          <p className="mb-4 text-gray-600">
            We may offer mobile apps (“Mobile Software”) to access the Service.
            You&apos;re granted a non-exclusive, revocable license to use the
            Mobile Software on one device you own or lease for personal use. You
            may not:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Modify, reverse-engineer, or copy the Mobile Software.</li>
            <li>Share or distribute it to others.</li>
            <li>Interfere with its security features.</li>
          </ul>
          <p className="mb-4 text-gray-600">
            The Mobile Software may auto-update, and these Terms apply to all
            updates. If you download our app from an app store (e.g., Apple App
            Store, Google Play), your use must comply with that store&apos;s
            terms. For apps from the Apple App Store, Apple isn&apos;t
            responsible for maintenance, support, or warranty issues, and any
            claims are between you and us, not Apple.
          </p>
          <p className="mb-4 text-gray-600">
            You&apos;re responsible for any mobile data charges from your
            wireless provider when using the Mobile Software or receiving text
            notifications.
          </p>

          <h2
            id="third-party-content-and-services"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            5. Third-Party Content and Services
          </h2>
          <p className="mb-4 text-gray-600">
            The Service may include links to third-party websites, ads, or
            content from Organizations or other users. We don&apos;t control or
            endorse these third parties and aren&apos;t responsible for their
            content, accuracy, or practices. Your interactions with third
            parties (e.g., payments to Organizations, participation in their
            activities) are solely between you and them. We&apos;re not liable
            for any harm, loss, or disputes arising from these interactions.
          </p>

          <h2
            id="paid-services-and-payments"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            6. Paid Services and Payments
          </h2>

          <h3
            id="paid-features"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            6.1 Paid Features
          </h3>
          <p className="mb-4 text-gray-600">
            Some features require payment. If you use these, you agree to our
            Subscriber Terms and Conditions and any related order forms. If
            there&apos;s a conflict, the Subscriber Terms prevail for paid
            features.
          </p>

          <h3
            id="payments-to-organizations"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            6.2 Payments to Organizations
          </h3>
          <p className="mb-4 text-gray-600">
            If you pay an Organization through the Service (e.g., for
            registration fees), the transaction is between you and the
            Organization. Contact the Organization directly for refunds or
            disputes. We&apos;re not responsible for incorrect charges or
            unfulfilled orders.
          </p>

          <h3
            id="payment-processing"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            6.3 Payment Processing
          </h3>
          <p className="mb-4 text-gray-600">
            If you&apos;re an Organization using our payment processing
            services, you must sign a Sub-Merchant Agreement with us and our
            payment processors (e.g., Stripe). You&apos;re responsible for
            complying with payment industry standards (e.g., PCI-DSS).
          </p>

          <h2
            id="background-screening"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            7. Background Screening
          </h2>
          <p className="mb-4 text-gray-600">
            If you use our background screening services, they&apos;re provided
            by third-party suppliers. You agree to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              Provide applicants with a clear, standalone disclosure and obtain
              their signed consent, per the Fair Credit Reporting Act (FCRA).
            </li>
            <li>
              Use screening reports only for employment purposes, as defined by
              FCRA.
            </li>
            <li>
              Provide applicants with a pre-adverse action notice, a copy of the
              report, and{" "}
              <Link
                href="https://www.consumerfinance.gov/about-us/newsroom/cfpb-publishes-updated-fcra-summary-of-consumer-rights/"
                className="text-blue-600 hover:underline"
              >
                A Summary of Your Rights Under the FCRA
              </Link>{" "}
              before taking adverse action.
            </li>
            <li>
              Submit proof of consents to us within 24 hours if requested.
            </li>
          </ul>
          <p className="mb-4 text-gray-600">
            Screening data may contain errors or omissions due to jurisdictional
            limits, and we&apos;re not liable for inaccuracies. You rely on
            screening results at your own risk.
          </p>

          <h2
            id="accessibility"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            8. Accessibility
          </h2>
          <p className="mb-4 text-gray-600">
            We strive to make the Service accessible to all users, in compliance
            with standards like the Americans with Disabilities Act (ADA) and
            Web Content Accessibility Guidelines (WCAG). Contact{" "}
            <Link
              href="mailto:support@CollegeAthleteNetwork.org"
              className="text-blue-600 hover:underline"
            >
              support@CollegeAthleteNetwork.org
            </Link>{" "}
            if you have accessibility concerns.
          </p>

          <h2
            id="intellectual-property"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            9. Intellectual Property
          </h2>
          <h3
            id="our-content"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            9.1 Our Content
          </h3>
          <p className="mb-4 text-gray-600">
            All content on the Service (e.g., text, logos, software), except
            User Content, is owned by us or our licensors (“Our Content”). You
            may not copy, modify, or distribute Our Content without permission.
          </p>
          <h3
            id="your-ideas"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            9.2 Your Ideas
          </h3>
          <p className="mb-4 text-gray-600">
            If you submit feedback or suggestions about the Service (“Ideas”),
            we may use them without obligation or compensation. We don&apos;t
            waive rights to similar ideas we already have or develop
            independently.
          </p>
          <h3
            id="our-data"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            9.3 Our Data
          </h3>
          <p className="mb-4 text-gray-600">
            Any statistics, records, or data generated by the Service (e.g.,
            game stats, player records) are owned by us and provided as a
            limited license. We may modify or delete this data at our
            discretion, and it has no cash value.
          </p>

          <h2
            id="no-warranty"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            10. No Warranty
          </h2>
          <p className="mb-4 text-gray-600">
            The Service is provided “as is” and “as available” without
            warranties of any kind. We don&apos;t guarantee:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              The Service will meet your needs or be uninterrupted, secure, or
              error-free.
            </li>
            <li>
              Content (including background screening results) is accurate or
              reliable.
            </li>
            <li>The Service is free of viruses or harmful components.</li>
          </ul>
          <p className="mb-4 text-gray-600">
            You use the Service at your own risk, and we&apos;re not responsible
            for damage to your device or data loss.
          </p>
          <p className="italic">
            *Some jurisdictions don&apos;t allow certain warranty exclusions, so
            these limits may not apply to you.*
          </p>

          <h2
            id="limitation-of-liability"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            11. Limitation of Liability
          </h2>
          <p className="mb-4 text-gray-600">
            To the fullest extent allowed by law, we, our affiliates, and
            licensors aren&apos;t liable for:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              Indirect, incidental, or consequential damages (e.g., loss of
              profits, data, or goodwill).
            </li>
            <li>
              Damages from hacking, unauthorized access, or Service
              interruptions.
            </li>
            <li>Errors in content or user interactions.</li>
            <li>Third-party products, services, or actions.</li>
          </ul>
          <p className="mb-4 text-gray-600">
            Our total liability for any claim is limited to $25.00. This applies
            to all claims, whether based on contract, tort, or other legal
            grounds.
          </p>
          <p className="italic">
            *Some jurisdictions don&apos;t allow certain liability limits, so
            these may not apply to you.*
          </p>

          <h2
            id="indemnity"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            12. Indemnity
          </h2>
          <p className="mb-4 text-gray-600">
            You agree to defend, indemnify, and hold us harmless from claims,
            damages, or costs (including attorney&apos;s fees) arising from:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Your use of the Service or User Content.</li>
            <li>Your violation of these Terms or any laws.</li>
            <li>
              Your violation of third-party rights (e.g., privacy, copyrights).
            </li>
            <li>Your interactions with Organizations or other users.</li>
            <li>
              Your use of background screening services or payment processing.
            </li>
          </ul>
          <p className="mb-4 text-gray-600">
            This obligation survives the termination of these Terms.
          </p>

          <h2
            id="dispute-resolution"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            13. Dispute Resolution
          </h2>

          <h3
            id="informal-resolution"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            13.1 Informal Resolution
          </h3>
          <p className="mb-4 text-gray-600">
            For any dispute, contact us first at{" "}
            <Link
              href="mailto:support@CollegeAthleteNetwork.org"
              className="text-blue-600 hover:underline"
            >
              support@CollegeAthleteNetwork.org
            </Link>
            . We&apos;ll try to resolve it within 60 days.
          </p>

          <h3
            id="arbitration"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            13.2 Arbitration
          </h3>
          <p className="mb-4 text-gray-600">
            If we can&apos;t resolve the dispute, you and we agree to binding
            arbitration through JAMS (
            <Link
              href="https://www.jamsadr.com"
              className="text-blue-600 hover:underline"
            >
              www.jamsadr.com
            </Link>
            ) in New York County, New York, under its Optional Expedited
            Arbitration Procedures. You may also use a small claims court for
            non-commercial disputes without arbitration. Arbitration costs are
            split for commercial users; for non-commercial users, we&apos;ll
            cover most costs if you qualify for a JAMS fee waiver. Arbitration
            decisions are final and enforceable in court.
          </p>
          <p className="font-semibold">
            Arbitration replaces court lawsuits and limits your ability to seek
            relief.
          </p>

          <h3
            id="class-action-and-jury-trial-waiver"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            13.3 Class Action and Jury Trial Waiver
          </h3>
          <p className="mb-4 text-gray-600">
            All claims must be brought individually, not as part of a class
            action, collective action, or other representative proceeding. You
            waive the right to a jury trial or to participate in class actions.
          </p>
          <p className="italic">
            *This waiver is critical and affects your legal rights.*
          </p>

          <h2
            id="governing-law"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            14. Governing Law
          </h2>
          <p className="mb-4 text-gray-600">
            These Terms are governed by New York State law, without regard to
            conflict of laws principles. The Federal Arbitration Act governs
            arbitration. For actions we pursue in court (e.g., to protect our
            intellectual property), you agree to the jurisdiction of federal and
            state courts in New York County, New York. International users are
            responsible for complying with their local laws.
          </p>

          <h2
            id="general-terms"
            className="text-2xl font-semibold mt-6 mb-3 text-gray-800"
          >
            15. General Terms
          </h2>

          <h3
            id="assignment"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            15.1 Assignment
          </h3>
          <p className="mb-4 text-gray-600">
            You may not transfer your rights under these Terms without our
            consent. We may assign these Terms without restriction.
          </p>

          <h3
            id="notifications"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            15.2 Notifications
          </h3>
          <p className="mb-4 text-gray-600">
            We may notify you via email, website notices, or other means. You
            can opt out of promotional emails but not Service-related notices.
            We&apos;re not responsible for filters blocking our emails.
          </p>

          <h3
            id="entire-agreement"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            15.3 Entire Agreement
          </h3>
          <p className="mb-4 text-gray-600">
            These Terms, along with our Privacy Policy, Subscriber Terms, and
            any order forms, are the complete agreement between you and us. If
            any provision is invalid, the rest remains enforceable, except if
            the class action waiver is unenforceable, then the arbitration
            clause is void.
          </p>

          <h3
            id="no-waiver"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            15.4 No Waiver
          </h3>
          <p className="mb-4 text-gray-600">
            Our failure to enforce any right doesn&apos;t waive it.
          </p>

          <h3
            id="contact"
            className="text-xl font-medium mt-4 mb-2 text-gray-700"
          >
            15.5 Contact
          </h3>
          <p className="mb-4 text-gray-600">
            Questions? Email us at{" "}
            <Link
              href="mailto:support@CollegeAthleteNetwork.org"
              className="text-blue-600 hover:underline"
            >
              support@CollegeAthleteNetwork.org
            </Link>
            .
          </p>
        </article>
      </main>
    </div>
  );
};

export default TermsOfService;
