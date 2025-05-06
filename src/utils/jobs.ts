export interface Job {
  position: string;
  location: string;
  positionType: string;
  shortDescription: string;
  longDescription: string;
  requirements: string;
}

export const jobs: Job[] = [
  {
    position: "University Partnerships Lead",
    location: "Remote",
    positionType: "Full-time",
    shortDescription:
      "Build relationships with athletic departments in The Big 10, SEC, and ACC Conferences.",
    longDescription:
      "We’re seeking a strategic and relationship-driven individual to lead partnerships with athletic departments in Power Five conferences. This role involves identifying key decision-makers, initiating and nurturing relationships, and developing collaborative agreements that support athlete engagement and platform growth.",
    requirements:
      "5+ years in partnership development or collegiate athletics. Strong communication skills. Deep familiarity with NCAA conferences, especially Big 10, SEC, and ACC.",
  },
  {
    position: "University Partnerships Lead",
    location: "Remote",
    positionType: "Full-time",
    shortDescription:
      "Build relationships with athletic departments in The Big East, Ivy, and NESCAC Conferences.",
    longDescription:
      "Join our growing team to lead outreach and partnerships with academically focused conferences. You’ll help craft outreach strategies, coordinate presentations, and foster trust with athletic departments at prestigious institutions to support their student-athletes' career development.",
    requirements:
      "5+ years in partnership or business development roles. Experience with academic or athletic institutions. Familiarity with The Big East, Ivy League, and NESCAC preferred.",
  },
  {
    position: "UX/UI Designer",
    location: "New York, NY",
    positionType: "Full-time",
    shortDescription:
      "Assist with digital campaigns focused on athlete outreach.",
    longDescription:
      "We’re looking for a creative UX/UI Designer to support athlete-facing initiatives. You'll design user flows, mobile-first interfaces, and digital assets that empower athletes to discover career resources. This role works closely with marketing and product teams.",
    requirements:
      "2+ years of experience in UX/UI design. Proficiency in Figma or similar tools. Strong portfolio demonstrating responsive design and user-centered thinking. Passion for athlete engagement is a plus.",
  },
  {
    position: "Data Analyst",
    location: "New York, NY",
    positionType: "Full-time",
    shortDescription: "Assist with data QA and cleaning algorithms.",
    longDescription:
      "The Data Analyst will support the integrity of our athlete database by building scalable data-cleaning pipelines, assisting with reporting, and verifying data accuracy. This role is ideal for someone passionate about clean, actionable data and process improvement.",
    requirements:
      "1-3 years of experience in data analysis. Proficiency in SQL, Python, Git, and AWS IaaS. Familiarity with data cleaning techniques and QA processes. Attention to detail is a must.",
  },
];
