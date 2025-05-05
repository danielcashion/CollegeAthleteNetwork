export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "What is The College Athlete Network?",
    answer:
      "The College Athlete Network is a platform designed to help college athletes navigate their careers after sports by connecting them with opportunities, resources, and a community of fellow athletes and alumni who understand their unique experiences and skills.",
  },
  {
    id: 2,
    question: "How do you support student-athletes?",
    answer:
      "We support student-athletes through tailored networking opportunities, career resources specific to their universities, mentorship connections with alumni athletes, and by helping them translate their athletic experiences into valuable professional skills.",
  },
  {
    id: 3,
    question: "Do you work directly with universities?",
    answer:
      "Yes, we partner with athletic departments across conferences like The Big 10, SEC, ACC, Big East, Ivy League, and NESCAC to create university-specific networks that connect current athletes with alumni from their schools.",
  },
  {
    id: 4,
    question: "I'm an employer. How can I connect with student-athletes?",
    answer:
      "Employers can partner with us to access our network of talented student-athletes and alumni. We can help you create recruitment campaigns, participate in virtual career fairs, and connect with athletes whose skills align with your company's needs.",
  },
  {
    id: 5,
    question: "What makes former athletes valuable employees?",
    answer:
      "Former athletes bring unique skills to the workplace, including discipline, teamwork, time management, resilience, leadership, and performance under pressure. These transferable skills make them exceptional employees across various industries.",
  },
];
