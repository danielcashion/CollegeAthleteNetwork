import { marketingMetadata } from "@/lib/seo/metadata";
import ContactTopSection from "@/components/ContactUsPage/ContactTopSecion";

export const metadata = marketingMetadata({
  title: "Contact Us",
  description:
    "Contact The College Athlete Network team about athlete networks, golf outings, networking events, and athletic department partnerships.",
  path: "/contact-us",
});
import ContactForm from "@/components/ContactUsPage/ContactForm";

const Contact = () => {
  return (
    <div className="flex flex-col">
      <ContactTopSection />
      <ContactForm />
    </div>
  );
};

export default Contact;
