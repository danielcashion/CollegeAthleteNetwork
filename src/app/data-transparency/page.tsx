import React from "react";

export default function DataTransparency() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-blue-900 mb-4">
          📘 Data Transparency & Compliance
        </h1>
        <p className="text-lg text-gray-700">
          At <strong>The College Athlete Network</strong>, we are committed to
          supporting universities and their athletes with integrity,
          transparency, and respect for compliance boundaries.
        </p>
        <p className="text-lg text-gray-700 mt-4">
          We understand that Athletic Departments must operate with care and
          accountability. That’s why we’ve structured our platform to be{" "}
          <strong>100% compliant, hands-off, and worry-free</strong> for our
          university partners:
        </p>
      </section>

      <section className="space-y-6">
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold">🎓 For Compliance Officers</h2>
          <p className="text-gray-700">
            While universities publish roster data publicly, we never request
            it, and never store it on your behalf. All data is sourced
            independently from public channels. This separation ensures that
            your institution is not responsible for our data in any way — and
            that there are no FERPA, custodial, or legal obligations.
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold">🏈 For Athletic Directors</h2>
          <p className="text-gray-700">
            Yes — rosters are posted by your university, and we respect that.
            But we never ask for your data, and you never share it with us.
            Everything we do is based on public info we gather ourselves. That’s
            how we support your athletes without creating work, responsibility,
            or compliance concerns for your staff.
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold">
            🧑‍💼 For University Leadership
          </h2>
          <p className="text-gray-700">
            We operate entirely independently of the university. While roster
            data is publicly available through your websites, we do not ask for
            it, and we never imply any institutional ownership of our platform.
            That clear boundary protects your brand, avoids compliance risk, and
            enables you to champion career success without assuming additional
            responsibility.
          </p>
        </div>
      </section>

      <section className="border-t pt-10">
        <h2 className="text-2xl font-bold mb-4">
          ✅ Key Compliance Assurances
        </h2>
        <ul className="space-y-6 text-gray-700 list-disc list-inside">
          <li>
            <strong>All Data is Public:</strong> We use only publicly available
            data sources, such as official team rosters, alumni publications,
            media guides, and publicly available professional bios. <br />
            <span className="italic">
              No private, FERPA-protected, or internal university data is ever
              used.
            </span>
          </li>
          <li>
            <strong>Universities Never Take Possession of Data:</strong> Our
            university partners do not provide, upload, or store any athlete or
            alumni data. All content is sourced and managed independently by our
            platform.
          </li>
          <li>
            <strong>No Data Sharing or Transfers:</strong> Universities are not
            sent copies of the data. All data is hosted and maintained on our
            platform solely by our team in our secured environment. Your
            institution remains completely separate from data collection and
            data custody.
          </li>
          <li>
            <strong>No Legal or Operational Burden:</strong> Our structure is
            specifically designed to ensure universities face no compliance,
            legal, or operational obligations. There is nothing for you to
            monitor, store, or report.
          </li>
        </ul>
      </section>

      <section className="border-t pt-10">
        <h2 className="text-2xl font-bold mb-4">
          🙌 Why Universities Partner With Us
        </h2>
        <ul className="space-y-4 text-gray-700 list-disc list-inside">
          <li>
            <strong>Celebrate Alumni Success:</strong> Our platform showcases
            the incredible career journeys of your former athletes — a powerful
            tool for recruiting, fundraising, and school pride.
          </li>
          <li>
            <strong>Support Career Outcomes:</strong> Student-athletes and
            alumni use the network to connect, share job opportunities, and
            build professional bridges within your community.
          </li>
          <li>
            <strong>Drive Engagement Without Risk:</strong> You get all the
            upside — visibility, engagement, career impact — with zero
            administrative risk or responsibility.
          </li>
        </ul>
      </section>
    </div>
  );
}
