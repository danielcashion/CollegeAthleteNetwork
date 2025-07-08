"use client";

import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/system";

const PrivacyContainer = styled(Container)({
  marginTop: "2rem",
  marginBottom: "2rem",
});

const Section = styled(Box)({
  marginBottom: "2rem",
});

const PrivacyListItem = styled(ListItem)({
  paddingLeft: 0,
});

export default function PrivacyPolicyComponent() {
  return (
    <div className="mb-20">
      <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white pb-12 pt-32 flex flex-col items-center px-[5%] sm:px-[10%]">
        <h1 className="text-5xl font-bold text-center mb-8 text-white tracking-wider small-caps w-full">
          Privacy Policy for <br />
          The College Athlete Network
        </h1>
      </div>

      <PrivacyContainer>
        <Typography
          variant="subtitle1"
          sx={{ textAlign: "right", color: "#ED3237", mb: 4 }}
          gutterBottom
        >
          Effective date: June 1st, 2025
        </Typography>

        <Typography
          variant="body1"
          sx={{ textAlign: "justify", color: "#1C315F" }}
          paragraph
        >
          <strong>The College Athlete Network LLC </strong> (“The Company,”
          “us,” “we,” or “our”) operates the{" "}
          <strong>www.collegeathletenetwork.org</strong> website (hereinafter
          referred to as the “Service”). This page informs you of our policies
          regarding the collection, use, and disclosure of public and personal
          data when you use our Service and the choices you have associated with
          that data.
        </Typography>

        <Typography
          variant="body1"
          sx={{ textAlign: "justify", color: "#1C315F" }}
          paragraph
        >
          To provide and improve our Service, we use publicly sourced data
          (e.g., publicly available team rosters, professional and educational
          profile data, social media) as well as source data from 3rd parties.
          By using the Service, you agree to the collection and use of
          information in accordance with this policy. Unless otherwise defined
          in this Privacy Policy, the terms used in this Privacy Policy have the
          same meanings as in our Terms and Conditions.
        </Typography>

        <Section>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            Table of Contents
          </Typography>
          <List dense style={{ color: "#1C315F", fontSize: "18px" }}>
            {[
              "Definitions",
              "Information Collection and Use",
              "Use of Data",
              "Legal Basis for Processing Personal Data under GDPR",
              "Retention of Data",
              "Transfer of Data",
              "Disclosure of Data",
              "Security of Data",
              "Do Not Track Signals",
              "Your GDPR Data Protection Rights",
              "Service Providers",
              "Analytics",
              "Payments",
              "Links to Other Sites",
              "Children's Privacy",
              "Changes to This Privacy Policy",
              "Contact Us",
            ].map((item) => (
              <PrivacyListItem key={item} disableGutters sx={{ pl: 6 }}>
                <ListItemText primary={item} />
              </PrivacyListItem>
            ))}
          </List>
        </Section>

        <Section>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            Summary
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            At <strong>The College Athlete Network LLC</strong>, we greatly
            value your privacy. This summary outlines how we handle your
            information when you use our website,{" "}
            <strong>www.collegeathletenetwork.org</strong>:
          </Typography>
          <List dense style={{ color: "#1C315F", fontSize: "18px" }}>
            {[
              "What We Collect: We collect personal details like your name, email, phone number, university, and sport(s) played, as well as public data from third-party sources (e.g., university rosters). We also gather usage data, like IP addresses and browsing activity, using cookies to improve your experience.",
              "How We Use It: Your data helps us provide and enhance our services, offer personalized features, ensure security, and analyze usage. We do not sell or distribute your personal data to any third parties.",
              "Your Rights: You can access, update, delete, or restrict your data. European users have additional GDPR rights, like data portability. Contact us at admin@collegeathletenetwork.org to exercise these rights.",
              "Data Sharing: We use trusted providers like Stripe for payments and Google Analytics for insights, but your data remains confidential and isn’t shared beyond these services.",
              "Security & Retention: We protect your data with encryption and other measures, retaining it only as long as needed (up to 36 months) or as required by law.",
              "Children’s Privacy: Our service is not for users under 18, and we don’t knowingly collect their data.",
            ].map((item) => (
              <PrivacyListItem key={item}>
                <ListItemText primary={item} sx={{ pl: 3, fontSize: "18px" }} />
              </PrivacyListItem>
            ))}
          </List>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            For details, read our full Privacy Policy below. Questions? Email us
            at{" "}
            <strong>
              <a href="mailto:admin@collegeathletenetwork.org">
                admin@collegeathletenetwork.org
              </a>
            </strong>
            .
          </Typography>
        </Section>

        {/* Definitions Section */}
        <Section>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            Definitions
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong> &quot;Service&quot;</strong> means the
            www.collegeathletenetwork.org website and any future mobile
            application operated by The College Athlete Network LLC.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong>&quot;Personal Data&quot;</strong> means data about a living
            individual who can be identified from those data (or from those and
            other information either in our possession or likely to come into
            our possession).
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong>&quot;Usage Data&quot;</strong> is data collected
            automatically, either generated by the use of the Service or from
            the Service infrastructure itself (for example, the duration of a
            page visit).
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong>&quot;Cookies&quot;</strong> are small files stored on your
            device (computer or mobile device).
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong>&quot;Data Controller&quot;</strong> means the natural or
            legal person who (either alone or jointly or in common with other
            persons) determines the purposes for which and the manner in which
            any personal information are or are to be processed. For the purpose
            of this Privacy Policy, we are a Data Controller of your Personal
            Data.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong>&quot;Data Processors (or Service Providers)&quot;</strong>{" "}
            means any natural or legal person who processes Personal Data on our
            behalf under our instructions, such as payment processors or
            analytics providers. For the purpose of this Privacy Policy, we are
            a Data Controller of your Personal Data.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            <strong>&quot;Data Subject (or User)&quot;</strong> is any living
            individual who is using our Service and is the subject of Personal
            Data.
          </Typography>
        </Section>

        {/* Information Collection and Use */}
        <Section>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            Information Collection and Use
          </Typography>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Types of Data Collected
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We collect several different types of information for various
            purposes to provide and improve our Service to you.
          </Typography>

          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Personal Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            While using our Service, we may ask you to provide us with certain
            personally identifiable information that can be used to contact or
            identify you (“Personal Data”). Personally identifiable information
            may include, but is not limited to:
          </Typography>
          <List style={{ color: "#1C315F" }} dense>
            {[
              "1. First name and last name",
              "2. Email address",
              "3. University Attended",
              "4. Sport(s) played",
              "5. Phone number",
              "6. IP Address",
            ].map((item) => (
              <PrivacyListItem key={item}>
                <ListItemText primary={item} sx={{ pl: 3, fontSize: "18px" }} />
              </PrivacyListItem>
            ))}
          </List>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We maintain and source publicly available professional, educational,
            and personal contact information for our athlete network users. We
            do not wish to be contacted by users for purposes unrelated to the
            intended use of this data. We do not and will not sell or distribute
            any Personal Data to any third parties.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We do not require any university to provide roster data; however, if
            a university chooses to do provide us with some of their additional
            data, such data will be kept strictly confidential.
          </Typography>

          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            User Usage Metrics
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We may also collect information on how the Service is accessed and
            used. This Usage Data may include information such as your
            computer’s Internet Protocol address (e.g. IP address), browser
            type, browser version, the pages of our Service that you visit, the
            time and date of your visit, the time spent on those pages, unique
            device identifiers and other diagnostic data.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            When you access the Service with a mobile device, this Usage Data
            may include information such as the type of mobile device you use,
            your mobile device unique ID, the IP address of your mobile device,
            your mobile operating system, the type of mobile Internet browser
            you use, unique device identifiers and other diagnostic data.
          </Typography>
        </Section>

        {/* Tracking & Cookie Data */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Tracking & Cookie Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We use cookies and similar tracking technologies to track the
            activity on our Service and we hold certain information.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Cookies are files with a small amount of data which may include an
            anonymous unique identifier. Cookies are sent to your browser from a
            website and stored on your device. Other tracking technologies are
            also used such as beacons, tags and scripts to collect and track
            information and to improve and analyze our Service.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            You can instruct your browser to refuse all cookies or to indicate
            when a cookie is being sent. However, if you do not accept cookies,
            you may not be able to use some portions of our Service.
          </Typography>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            Examples of Cookies we use:
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Session Cookies. We use Session Cookies to operate our Service.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Preference Cookies. We use Preference Cookies to remember your
            preferences and various settings.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Security Cookies. We use Security Cookies for security purposes.
          </Typography>
        </Section>

        {/* Use of Data */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Use of Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            The Company uses the collected data for various purposes:
          </Typography>
          <List dense style={{ color: "#1C315F", fontSize: "18px" }}>
            {[
              "To provide and maintain our Service",
              "To notify you about changes to our Service",
              "To allow you to participate in interactive features of our Service when you choose to do so",
              "To provide high quality customer support",
              "To gather analysis or valuable information so that we can improve our Service",
              "To monitor the usage of our Service",
              "To detect, prevent, and address technical issues",
            ].map((item) => (
              <PrivacyListItem key={item}>
                <ListItemText primary={item} />
              </PrivacyListItem>
            ))}
          </List>
        </Section>

        {/* GDPR */}
        <Section>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            LEGAL BASIS FOR PROCESSING PERSONAL DATA UNDER THE GENERAL DATA
            PROTECTION REGULATION (GDPR)
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            If you are from the European Economic Area (EEA), The Company’s
            legal basis for collecting and using the personal information
            described in this Privacy Policy depends on the Personal Data we
            collect and the specific context in which we collect it.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            As a resident of the European Economic Area (EEA), you have certain
            data protection rights. The Company aims to take reasonable steps to
            allow you to correct, amend, delete or limit the use of your
            Personal Data. If you wish to be informed about what Personal Data
            we hold about you and if you want it to be removed from our systems,
            please contact us.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We process Personal Data based on your consent (e.g., for account
            creation), legitimate interests (e.g., to improve our Service), or
            to fulfill contractual obligations. To exercise your GDPR rights,
            such as accessing or deleting your data, email us at
            admin@collegeathletenetwork.org. We will respond within 30 days
            after verifying your identity.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            In certain circumstances, you have the following data protection
            rights:
          </Typography>
          <List dense style={{ color: "#1C315F", fontSize: "18px" }}>
            {[
              "1. The right to access, update or delete the information we have on you. Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.",
              "2. The right of rectification. You have the right to have your information rectified if that information is inaccurate or incomplete.",
              "3. The right to object. You have the right to object to our processing of your Personal Data.",
              "4. The right of restriction. You have the right to request that we restrict the processing of your personal information.",
              "5. The right to data portability. You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.",
              "6. The right to withdraw consent. You also have the right to withdraw your consent at any time where The Company relied on your consent to process your personal information.",
            ].map((item) => (
              <PrivacyListItem key={item}>
                <ListItemText primary={item} sx={{ pl: 3, fontSize: "18px" }} />
              </PrivacyListItem>
            ))}
          </List>

          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Please note that we may ask you to verify your identity before
            responding to such requests.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            You have the right to complain to a Data Protection Authority about
            our collection and use of your Personal Data. For more information,
            please contact your local data protection authority in the European
            Economic Area (EEA).
          </Typography>
        </Section>

        {/* Retention of Data */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Retention of Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            The Company will retain your Personal Data only for as long as is
            necessary as described in this Privacy Policy, but for no more then
            36 months on a rolling basis. We will retain and use your Personal
            Data only to the extent necessary to comply with our legal
            obligations, resolve disputes, and enforce our legal agreements and
            policies.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            The Company will also retain Usage Data for internal analysis
            purposes. Usage Data is generally retained for a shorter period of
            time, except when this data is used to strengthen the security or to
            improve the functionality of our Service, or we are legally
            obligated to retain this data for longer periods.
          </Typography>
        </Section>

        {/* Service Providers */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Service Providers
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We do not employ third party companies and individuals to facilitate
            our Service (“Service Providers”), provide the Service on our
            behalf, perform Service-related services or assist us in analyzing
            how our Service is used.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            No third parties will have access to our Personal Data or will be
            able to disclose or use it for any other lawful purpose.
          </Typography>
        </Section>

        {/* Analytics */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Analytics
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We may use third-party Service Providers to monitor and analyze the
            use of our Service.
          </Typography>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Google Analytics
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Google Analytics is a web analytics service offered by Google that
            tracks and reports website traffic. Google uses the data collected
            to track and monitor the use of our Service. This data is shared
            with other Google services. Google may use the collected data to
            contextualise and personalise the ads of its own advertising
            network. For more information on the privacy practices of Google,
            please visit the Google Privacy & Terms web page:
            <a
              href="https://policies.google.com/privacy?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://policies.google.com/privacy
            </a>
            .
          </Typography>
        </Section>

        {/* Payments */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Payments
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We provide paid products and/or services within the Service. In that
            case, we use a third-party service named Stripe for payment
            processing (e.g. payment processors). Stripe&apos;s Privacy Policy can be
            viewed at{" "}
            <a
              href="https://stripe.com/us/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://stripe.com/us/privacy
            </a>
            .
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We do not and will not store or collect your payment card details.
            That information is provided directly to our third-party payment
            processors whose use of your personal information is governed by
            their Privacy Policy. These payment processors adhere to the
            standards set by PCI-DSS as managed by the PCI Security Standards
            Council, which is a joint effort of brands like Visa, MasterCard,
            American Express and Discover. PCI-DSS requirements help ensure the
            secure handling of payment information.
          </Typography>
        </Section>

        {/* Children's Policy */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Children&apos;s Policy
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Our Service is not directed to anyone under the age of 13, and we do
            not knowingly collect personally identifiable information from
            children under 13, in compliance with the Children’s Online Privacy
            Protection Act (COPPA). If you are a parent or guardian and you are
            aware that your child has provided us with Personal Data, please
            contact us. If we become aware that we have collected Personal Data
            from children under 13 without verification of parental consent, we
            take steps to remove that information from our servers.
          </Typography>
        </Section>

        {/* Changes */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Changes to this Privacy Policy
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We may and we do update our Privacy Policy from time to time. We
            will notify you of any changes by posting the new Privacy Policy on
            this page. You are advised to review this Privacy Policy
            periodically for any changes. Changes to this Privacy Policy are
            effective when they are posted on this page.
          </Typography>
        </Section>

        {/* Transfer of Data */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Transfer of Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Your information, including Personal Data, may be transferred to —
            and maintained on — computers located outside of your state,
            province, country or other governmental jurisdiction where the data
            protection laws may differ from those of your jurisdiction.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            If you are located outside United States and choose to provide
            information to us, please note that we transfer the data, including
            Personal Data, to United States and process it there.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Your consent to this Privacy Policy followed by your submission of
            such information represents your agreement to that transfer.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            The Company will take all reasonably necessary steps to ensure that
            your Personal Data is handled securely and in accordance with this
            Privacy Policy. We will not transfer your Personal Data to any
            organization or country unless adequate safeguards are in place,
            including measures to protect the security and confidentiality of
            your data and other personal information.
          </Typography>
        </Section>

        {/* Disclosure of Data */}
        <Section>
          <Typography variant="h4" gutterBottom style={{ color: "#1C315F" }}>
            Disclosure of Data
          </Typography>
          <Typography variant="h5" paragraph style={{ color: "#1C315F" }}>
            Business Transaction
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            If The Company is involved in a merger, acquisition or asset sale,
            our Personal Data may be transferred. We will provide users notice
            before our Personal Data is transferred and becomes subject to a
            different Privacy Policy.
          </Typography>
          <Typography variant="h5" paragraph style={{ color: "#1C315F" }}>
            Disclosure for Law Enforcement
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            Under certain circumstances, The Company may be required to disclose
            your Personal Data if required to do so by law or in response to
            valid requests by public authorities (e.g. a court or a government
            agency).
          </Typography>
          <Typography variant="h5" paragraph style={{ color: "#1C315F" }}>
            Legal Requirements
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            The Company may disclose your Personal Data in the good faith belief
            that such action is necessary to:
          </Typography>
          <List dense style={{ color: "#1C315F", fontSize: "18px" }}>
            {[
              "1. To comply with a legal obligation.",
              "2. To protect and defend the rights or property of www.collegeathletenetwork.org.",
              "3. To prevent or investigate possible wrongdoing in connection with the Service",
              "4. To protect the personal safety of users of the Service or the public",
              "5. To protect The Company against legal liability.",
            ].map((item) => (
              <PrivacyListItem key={item}>
                <ListItemText primary={item} sx={{ pl: 3, fontSize: "18px" }} />
              </PrivacyListItem>
            ))}
          </List>
        </Section>

        {/* Disclosure of Data */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            OUR POLICY ON “DO NOT TRACK” SIGNALS UNDER THE CALIFORNIA ONLINE
            PROTECTION ACT (CALOPPA)
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            We do not support Do Not Track (“DNT”). Do Not Track is a preference
            you can set in your web browser to inform websites that you do not
            want to be tracked.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            You can enable or disable Do Not Track by visiting the Preferences
            or Settings page of your web browser.
          </Typography>
        </Section>

        {/* Security of Data */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Security of Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            The security of our data is important to us. But remember that no
            method of transmission over the Internet or method of electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Data, we cannot guarantee
            its absolute security. We employ access controls, encryption,
            2-factor authentication, and other commercially reasonable measures
            to protect our data.
          </Typography>
        </Section>

        {/* Contact Us */}
        <Section>
          <Typography variant="h5" gutterBottom style={{ color: "#1C315F" }}>
            Contact Us
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "justify", color: "#1C315F" }}
            paragraph
          >
            If you have any questions about this Privacy Policy, please contact
            us by email at <strong>admin@collegeathletenetwork.org</strong>.
          </Typography>
        </Section>
      </PrivacyContainer>
    </div>
  );
}
