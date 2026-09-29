import type { Metadata } from "next";
import LegalDocument from "@/components/Legal/LegalDocument";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "The College Athlete Network accessibility statement, including WCAG 2.2, ADA, and Section 508 commitments.",
};

const accessibilityToc = [
  { href: "#accessibility-policy-heading", label: "Accessibility Policy Statement" },
  { href: "#legal-compliance-heading", label: "Legal Compliance" },
];

export default function AccessibilityPolicyPage() {
  return (
    <LegalDocument
      title="Accessibility Statement"
      summary="Our commitment to an accessible website and the standards we use to measure that work."
      effectiveDate="June 2, 2025"
      toc={accessibilityToc}
      related={[
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms-of-service", label: "Terms of Service" },
      ]}
    >
      <p>
        <a
          href="https://collegeathletenetwork.s3.us-east-1.amazonaws.com/InternalDocuments/CollegeAthleteNetworkAccessibilityConformanceReport202506.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Accessibility Conformance Report (PDF)
        </a>
      </p>

      <section aria-labelledby="accessibility-policy-heading">
        <h2 id="accessibility-policy-heading">Accessibility Policy Statement</h2>
        <p>
          We at <strong>The College Athlete Network</strong> are firmly
          committed to ensuring digital accessibility for all users, including
          those with disabilities. We strive to provide an inclusive online
          platform that empowers college athletes, coaches, and recruiters to
          connect, collaborate, and thrive. Accessibility is a core value, and
          we are dedicated to meeting the needs of individuals with diverse
          abilities, ensuring equal access to our services and resources in
          compliance with applicable accessibility standards, including the{" "}
          <strong>Web Content Accessibility Guidelines (WCAG) 2.2</strong>.
        </p>
        <p>
          We recognize the importance of creating a seamless and equitable user
          experience for everyone, regardless of visual, auditory, motor, or
          cognitive impairments. To achieve this, we have implemented a
          comprehensive accessibility strategy that includes regular audits of
          our website to identify and address barriers to access. Our
          development team prioritizes accessible design principles, such as
          providing text alternatives for non-text content, ensuring keyboard
          navigability, and maintaining sufficient color contrast to enhance
          readability. We also incorporate assistive technologies, such as
          screen readers, into our testing processes to ensure compatibility
          and usability.
        </p>
        <p>
          Our commitment extends beyond technical compliance. We actively seek
          feedback from users to continually improve the accessibility of our
          platform. By fostering an inclusive environment, we aim to support the
          diverse needs of our community, enabling all users to engage fully
          with our networking tools and resources. We provide training for our
          staff to stay informed about accessibility best practices and emerging
          technologies.
        </p>
        <p>
          We are dedicated to ongoing improvement and welcome input from our
          users to enhance accessibility. If you encounter any accessibility
          challenges or have suggestions, please contact us at{" "}
          <a
            href="mailto:admin@collegeathletenetwork.org"
            aria-label="Email for accessibility feedback"
          >
            admin@collegeathletenetwork.org
          </a>
          . Together, we can build a more inclusive digital space for college
          athletes and their supporters.
        </p>
      </section>

      <section aria-labelledby="legal-compliance-heading">
        <h2 id="legal-compliance-heading">Legal Compliance</h2>
        <p>
          The College Athlete Network is committed to complying with all
          applicable accessibility laws and standards, including the{" "}
          <strong>Americans with Disabilities Act (ADA)</strong> and{" "}
          <strong>Section 508 of the Rehabilitation Act</strong>. We strive to
          ensure our website and digital services are accessible to individuals
          with disabilities and meet or exceed the requirements set forth by
          these regulations. Our ongoing efforts include regular accessibility
          audits, staff training, and prompt response to user feedback regarding
          accessibility barriers.
        </p>
      </section>
    </LegalDocument>
  );
}
