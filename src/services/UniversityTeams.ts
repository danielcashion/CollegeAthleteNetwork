export const getUniversityTeams = async ({
  universityName,
}: {
  universityName: string;
}) => {
  let currentUniversityName = universityName;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/publicprod/university_teams?university_name=${encodeURIComponent(
        currentUniversityName
      )}`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch university teams: ${res.status}`);
    }

    const data = await res.json();

    // Check if data is an empty array
    if (Array.isArray(data) && data.length === 0 && attempts === 0) {
      // Retry with "Typcial University"
      currentUniversityName = "Typical University";
      attempts++;
      continue;
    }

    return data;
  }

  // Return the data from the final attempt
  return [];
};
