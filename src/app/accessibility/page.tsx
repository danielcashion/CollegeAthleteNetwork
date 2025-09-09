
"use client";

import {
	Container,
	Typography,
	Box,
} from "@mui/material";
import { styled } from "@mui/system";

const AccessibilityContainer = styled(Container)({
	marginTop: "2rem",
	marginBottom: "2rem",
});

const Section = styled(Box)({
	marginBottom: "2rem",
	background: "#fff",
	borderRadius: "18px",
	boxShadow: "0 4px 24px rgba(28,49,95,0.08)",
	padding: "2.5rem 2rem",
	maxWidth: "900px",
	marginLeft: "auto",
	marginRight: "auto",
});

export default function AccessibilityPolicyPage() {
	 return (
     <>
       {/* Skip to main content link for accessibility */}
       <a
         href="#main-content"
         className="skip-link absolute left-2 top-2 bg-white text-[#1C315F] px-4 py-2 z-50 focus:translate-y-0 -translate-y-20 focus:outline-none focus:ring-2 focus:ring-[#ED3237]"
         style={{ borderRadius: "6px" }}
       >
         Skip to main content
       </a>
       <div
         className="mb-20"
         aria-label="Accessibility Policy Page"
         role="region"
       >
         <div
           className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pb-12 pt-32 flex flex-col items-center px-[5%] sm:px-[10%]"
           role="banner"
         >
           <h1
             className="text-5xl font-bold text-center mb-8 text-white tracking-wider small-caps w-full"
             id="main-content"
             tabIndex={-1}
           >
             We Take Accessibility Seriously
           </h1>
         </div>

         <section aria-labelledby="main-content">
           <AccessibilityContainer>

             <Typography
               component="p"
               variant="subtitle1"
               sx={{ textAlign: "right", color: "#ED3237", mb: 1 }}
               gutterBottom
               aria-label="Effective date"
             >
               Effective date: June 2nd, 2025
             </Typography>
             <a
               href="https://collegeathletenetwork.s3.us-east-1.amazonaws.com/InternalDocuments/CollegeAthleteNetworkAccessibilityComplanceReport202506.pdf"
               target="_blank"
               rel="noopener noreferrer"
               style={{ display: "block", textAlign: "right", color: "#1C315F", marginBottom: "1.5rem", fontWeight: 500 }}
             >
               Access Our Accessibility Conformance Report (PDF)
             </a>

             <section aria-labelledby="accessibility-policy-heading">
               <Section>
                 <Typography
                   component="h2"
                   id="accessibility-policy-heading"
                   variant="h4"
                   sx={{
                     color: "#1C315F",
                     fontWeight: 700,
                     mb: 3,
                     textAlign: "center",
                     letterSpacing: 1,
                   }}
                   gutterBottom
                 >
                   Accessibility Policy Statement
                 </Typography>
                 <Typography
                   component="p"
                   variant="body1"
                   sx={{
                     textAlign: "justify",
                     color: "#1C315F",
                     fontSize: "1.15rem",
                     mb: 2,
                     lineHeight: 1.8,
                   }}
                   paragraph
                 >
                   Our college athlete networking website is committed to ensuring
                   digital accessibility for all users, including those with
                   disabilities. We strive to provide an inclusive online platform
                   that empowers college athletes, coaches, and recruiters to
                   connect, collaborate, and thrive. Accessibility is a core
                   value, and we are dedicated to meeting the needs of individuals
                   with diverse abilities, ensuring equal access to our services
                   and resources in compliance with applicable accessibility
                   standards, including the Web Content Accessibility Guidelines
                   (WCAG) 2.1.
                 </Typography>
                 <Typography
                   component="p"
                   variant="body1"
                   sx={{
                     textAlign: "justify",
                     color: "#1C315F",
                     fontSize: "1.15rem",
                     mb: 2,
                     lineHeight: 1.8,
                   }}
                   paragraph
                 >
                   We recognize the importance of creating a seamless and
                   equitable user experience for everyone, regardless of visual,
                   auditory, motor, or cognitive impairments. To achieve this, we
                   have implemented a comprehensive accessibility strategy that
                   includes regular audits of our website to identify and address
                   barriers to access. Our development team prioritizes accessible
                   design principles, such as providing text alternatives for
                   non-text content, ensuring keyboard navigability, and
                   maintaining sufficient color contrast to enhance readability.
                   We also incorporate assistive technologies, such as screen
                   readers, into our testing processes to ensure compatibility and
                   usability.
                 </Typography>
                 <Typography
                   component="p"
                   variant="body1"
                   sx={{
                     textAlign: "justify",
                     color: "1C315F",
                     fontSize: "1.15rem",
                     mb: 2,
                     lineHeight: 1.8,
                   }}
                   paragraph
                 >
                   Our commitment extends beyond technical compliance. We actively
                   seek feedback from users to continually improve the
                   accessibility of our platform. By fostering an inclusive
                   environment, we aim to support the diverse needs of our
                   community, enabling all users to engage fully with our
                   networking tools and resources. We provide training for our
                   staff to stay informed about accessibility best practices and
                   emerging technologies.
                 </Typography>
                 <Typography
                   component="p"
                   variant="body1"
                   sx={{
                     textAlign: "justify",
                     color: "#1C315F",
                     fontSize: "1.15rem",
                     lineHeight: 1.8,
                   }}
                   paragraph
                 >
                   We are dedicated to ongoing improvement and welcome input from
                   our users to enhance accessibility. If you encounter any
                   accessibility challenges or have suggestions, please contact us
                   at{" "}
                   <a
                     href="mailto:admin@collegeathletenetwork.org"
                     className="text-blue-600 underline"
                     aria-label="Email for accessibility feedback"
                   >
                     admin@collegeathletenetwork.org
                   </a>
                   . Together, we can build a more inclusive digital space for
                   college athletes and their supporters.
                 </Typography>

                 <Typography
                   component="h3"
                   id="legal-compliance-heading"
                   variant="h5"
                   sx={{ color: "#1C315F", fontWeight: 600, mt: 4, mb: 2 }}
                   gutterBottom
                 >
                   Legal Compliance
                 </Typography>
                 <Typography
                   component="p"
                   variant="body1"
                   sx={{
                     textAlign: "justify",
                     color: "#1C315F",
                     fontSize: "1.08rem",
                     lineHeight: 1.7,
                   }}
                   paragraph
                 >
                   The College Athlete Network is committed to complying with all
                   applicable accessibility laws and standards, including the
                   Americans with Disabilities Act (ADA) and Section 508 of the
                   Rehabilitation Act. We strive to ensure our website and digital
                   services are accessible to individuals with disabilities and
                   meet or exceed the requirements set forth by these regulations.
                   Our ongoing efforts include regular accessibility audits, staff
                   training, and prompt response to user feedback regarding
                   accessibility barriers.
                 </Typography>
               </Section>
             </section>
           </AccessibilityContainer>
         </section>
       </div>
     </>
   );
}
