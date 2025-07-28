export const getUniversityTeams = async ({
  universityName,
}: {
  universityName: string;
}) => {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/publicprod/university_teams?university_name=${encodeURIComponent(
      universityName
    )}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch university teams: ${res.status}`);
  }

  const data = await res.json();

  return data;
};
