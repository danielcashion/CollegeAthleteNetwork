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
    name: "Sarah Johnson",
    role: "Former D1 Soccer Player",
    university: "University of Michigan",
    quote:
      "The College Athlete Network helped me connect with alumni who understood my unique experience as a student-athlete. I landed my dream job in sports marketing because of the connections I made here.",
  },
  {
    id: 2,
    name: "Marcus Williams",
    role: "Former Basketball Player",
    university: "Duke University",
    quote:
      "Transitioning from college sports to a professional career was daunting, but The College Athlete Network made it seamless. The community and resources they provide are invaluable.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Former Track & Field Athlete",
    university: "Stanford University",
    quote:
      "I was worried about life after athletics, but this platform connected me with mentors who had been in my shoes. Now I'm thriving in my tech career and mentoring others.",
  },
  {
    id: 4,
    name: "Tyler Bennett",
    role: "Former Football Player",
    university: "Ohio State University",
    quote:
      "The network's university-specific connections helped me leverage my athletic experience in job interviews. I'm now working at a company where my leadership skills are valued every day.",
  },
  {
    id: 5,
    name: "Jasmine Chen",
    role: "Former Volleyball Player",
    university: "UCLA",
    quote:
      "As a student-athlete, I developed skills that employers value. The College Athlete Network helped me articulate those skills and connect with companies that appreciate my background.",
  },
];
