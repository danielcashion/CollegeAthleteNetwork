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
    name: "Network Data",
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
    name: "Network Engagement & Activation",
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
    ],
  },
  { name: "Corporate Partners", link: "/corporate-partners", type: "link" },
  { name: "About Us", link: "/about-us", type: "link" },
  { name: "Contact Us", link: "/contact-us", type: "link" },
  {
    name: "Login",
    link: "http://members.collegeathletenetwork.org/",
    type: "button",
    target: "_blank",
  },
];
