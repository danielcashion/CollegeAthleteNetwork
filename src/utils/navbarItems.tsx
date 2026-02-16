export type NavItem = {
  name: string;
  link?: string;
  type: "link" | "button" | "noLink";
  subItems?: NavItem[];
  target?: string;
};

export const navbarItems: NavItem[] = [
  { name: "Home", link: "/", type: "link" },
  {
    name: "Athlete Network Data",
    type: "noLink",
    subItems: [
      {
        name: "Sample University Coverage",
        link: "/sample-data",
        type: "link",
      },
      {
        name: "Data Transparency & Compliance",
        link: "/data-transparency",
        type: "link",
      },
    ],
  },

  {
    name: "Solutions",
    type: "noLink",
    subItems: [
      {
        name: "Athlete Checklists & Management",
        link: "/athlete-checklist",
        type: "link",
      },
      {
        name: "Network Communications",
        link: "/communications",
        type: "link",
      },
            {
        name: "Elevated Fundraising",
        link: "/fundraising",
        type: "link",
      },
                        {
        name: "Alumni Engagement Infrastructure",
        link: "/infrastructure",
        type: "link",
      },
    ],
  },

  {
    name: "Groups We Serve",
    type: "noLink",
    subItems: [
      {
        name: "Athletic Department Administration",
        link: "/personas/athletic-department-administration",
        type: "link",
      },
      {
        name: "Alumni & Students",
        link: "/personas/alumni-students",
        type: "link",
      },

      {
        name: "Development Officers",
        link: "/personas/development-officers",
        type: "link",
      },
      {
        name: "Corporate HR/Recruiting",
        link: "/corporate-partners",
        type: "link",
      },
    ],
  },

  {
    name: "About",
    type: "noLink",
    subItems: [
      {
        name: "About Us",
        link: "/about-us",
        type: "link",
      },
      {
        name: "Contact Us",
        link: "/contact-us",
        type: "link",
      },
      {
        name: "Join Us",
        link: "/join-us",
        type: "link",
      },
            {
        name: "FAQs",
        link: "/faqs",
        type: "link",
      },
    ],
  },

  {
    name: "Login",
    link: "http://members.collegeathletenetwork.org/",
    type: "button",
    target: "_blank",
  },
];
