// app/network/[university]/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';

type UniversityMeta = {
  university_name: string;
  logo_url: string;
  primary_hex: string[];
  secondary_hex: string[];
  base_url: string;
};

type Props = {
  params: { university_name: string };
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/university_meta`);
  const universities: UniversityMeta[] = await res.json();

  return universities.map((uni) => ({
    university: slugify(uni.university_name),
    primary_hex: uni.primary_hex,
    secondary_hex: uni.secondary_hex,
    logo_url: uni.logo_url,
    base_url: uni.base_url,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/university_meta`);
  const universities: UniversityMeta[] = await res.json(); 

  const uni = universities.find((u) => slugify(u.university_name) === params.university_name);

  if (!uni) {
    return {
      title: `${params.university_name} Athletic Network`,
      description: `Explore ${params.university_name} athletes and professional opportunities!`,
    };
  }

  return {
    title: `${uni.university_name} Athletic Network | The College Athlete Network`,
    description: `Explore ${uni.university_name}'s athlete and alumni career network.`,
    openGraph: {
      title: `${uni.university_name} Athletic Network`,
      description: `Connect with ${uni.university_name} athletes and alumni.`,
      images: [uni.logo_url],
    },
  };
}

export default async function UniversityPage({ params }: Props) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/university_meta`);
  const universities: UniversityMeta[] = await res.json();

  const university = universities.find((u) => slugify(u.university_name) === params.university_name);

  if (!university) return <div className="p-8">University not found.</div>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Image
        src={university.logo_url}
        alt={`${university.university_name} Logo`}
        width={120}
        height={120}
        className="mb-6"
      />
      <h1 className="text-4xl font-bold mb-4">{university.university_name} Athletic Network</h1>
      <p className="text-lg mb-6">
        Connect with student-athletes, alumni, and supporters from {university.university_name}. Discover jobs,
        mentorship, and lifelong connections.
      </p>
      <div className="flex gap-2">
        {[...university.primary_hex, ...university.secondary_hex].map((hex) => (
          <div key={hex} className="w-6 h-6 rounded-full border" style={{ backgroundColor: hex }}></div>
        ))}
      </div>
    </main>
  );
}
