export interface Testimonial {
  id: number;
  name: string;
  role: string;
  university: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Olivia Woodson",
    role: "Current Soccer Player",
    university: "SEC Conference University",
    quote:
      "The College Athlete Network providing me the roadmap to find and connect with athlete alumni who were eager to help their fellow student athlete. I landed my dream job in sports marketing because of the connections I discovered using their network software.",
  },
  {
    id: 2,
    name: "Kale Catching",
    role: "Former D1 Basketball Player",
    university: "ACC Conference University",
    quote:
      "Transitioning from college sports to a professional career was daunting, but The College Athlete Network made it seamless. The mapping of the athlete network, along with the checklists they provide are invaluable.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Former Track & Field Athlete",
    university: "Stanford University",
    quote:
      "I was worried about life after athletics, but this platform connected me with my school&apos;s athlete network. All of them had been in my shoes and we very friendly when called upon. Highly recommend this to all athletes.",
  },
  {
    id: 4,
    name: "Tyler Bennett",
    role: "Former Football Player",
    university: "Big 10 Conference University",
    quote:
      "The network's university-specific connections helped me leverage my athletic experience in job interviews. I'm now working at a company where my leadership skills are valued every day.",
  },
  {
    id: 5,
    name: "Kylie Miller",
    role: "Current D1 Volleyball Player",
    university: "PAC-12 Conference University",
    quote:
      "As a student-athlete, I developed skills that employers value. The College Athlete Network helped me articulate those skills and connect with companies that appreciate my background.",
  },
];
