export type FAQ = {
  question: string;
  answer: string;
};

export type PersonaFaqs = {
  id: string;
  label: string;
  faqs: FAQ[];
};

export const personaFaqs: PersonaFaqs[] = [
  {
    id: "students",
    label: "Student-Athletes",
    faqs: [
      {
        question: "What is the College Athlete Network, and how does it help me?",
        answer:
          "The College Athlete Network gives you instant access to your school's complete athlete and alumni network—without you having to build it yourself. We map your university's athletes and alumni to their public professional data so you can see who alumni are, where they work, what roles they hold, and what in-network opportunities are available.\n\nThe goal is simple: help you secure internships, jobs, and professional connections faster—using a network that already exists.",
      },
      {
        question: "Do I have to create and maintain my own profile?",
        answer:
          "No. Unlike traditional platforms, the network is fully pre-populated when your school launches. Alumni and career data are refreshed automatically every 60 days, so the network stays accurate without requiring athletes or alumni to manually update profiles.",
      },
      {
        question: "Is this just for my sport, or all athletes?",
        answer:
          "It includes all sports at your university. Career networks don't stop at team boundaries, and neither do professional opportunities. The College Athlete Network connects athletes and alumni across every sport to maximize reach and access.",
      },
      {
        question: "Does this cost me anything?",
        answer:
          "No. Student-athletes at participating universities use the platform at no cost.",
      },
    ],
  },
  {
    id: "alumni",
    label: "Alumni",
    faqs: [
      {
        question: "Why would I use the College Athlete Network?",
        answer:
          "The platform makes it easy to give back in meaningful ways—by hiring athletes, offering advice, or sharing opportunities—without being overwhelmed by ad-hoc emails, spreadsheets, or one-off requests.\n\nIt also serves as a focused, school-specific professional network. If you're exploring new opportunities or expanding business connections, this is a curated \"mini-LinkedIn\" built around the strongest network you already belong to: your university's athletes and alumni.",
      },
      {
        question: "Do I need to actively update my information?",
        answer:
          "No. Professional data is automatically refreshed every 60 days, ensuring the network remains current even if you're not actively logging in.",
      },
      {
        question: "How is my information used and protected?",
        answer:
          "The College Athlete Network is a private, school-specific platform. Data is used solely to support athlete outcomes and alumni engagement. Information is never sold or made public.",
      },
      {
        question: "My company is hiring—can I post opportunities?",
        answer:
          "Yes. Alumni can post job opportunities or indicate availability to help athletes. There is no cost to post, and opportunities are visible to athletes and the athletic department. Hiring within your university's athlete network keeps talent—and impact—within the community.",
      },
    ],
  },
  {
    id: "coaches",
    label: "Coaches & Administrators",
    faqs: [
      {
        question:
          "How is this different from spreadsheets, LinkedIn groups, or team-specific alumni lists?",
        answer:
          "Those approaches fail because they rely on manual upkeep, fragmented ownership, and inconsistent participation. The College Athlete Network launches with 100% coverage across all sports and stays current through automated data refreshes.\n\nBy centralizing and professionalizing what is often managed informally by coaches or alumni groups, the department gains quality control over its most valuable long-term asset: the athlete and alumni network.",
      },
      {
        question: "How much work is required from our staff to maintain the network?",
        answer:
          "None. There is no ongoing administrative burden. Data population, updates, and infrastructure are handled centrally so staff can focus on athlete development—not data management.",
      },
      {
        question: "What outcomes should we expect?",
        answer:
          "Schools using the platform see measurable improvements in:\n\n• Alumni engagement and donor participation\n• Cross-sport collaboration\n• Internship and full-time job placement\n• Corporate and alumni relationship activation\n\nThe network becomes a living asset, not a static directory.",
      },
      {
        question: "Who pays for this?",
        answer:
          "Typically, the platform is funded by a corporate sponsor or an alumni association whose goal is to support both current athletes and alumni. The College Athlete Network is directly aligned with that mission.",
      },
    ],
  },
];

export function allFaqsForJsonLd() {
  return personaFaqs.flatMap((persona) => persona.faqs);
}
