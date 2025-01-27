/* eslint-disable @typescript-eslint/no-explicit-any */

/* this function prepares the data received from the api at 
https://api.tourneymaster.org/publicprod/sport_coverage 
into a format to be used in the collapsible data table */
export const prepareData = (data: any[]) => {
  const grouped: Record<string, any> = {};

  data.forEach((item) => {
    const univ = item.university_name;

    // Initialize the group if not present
    if (!grouped[univ]) {
      grouped[univ] = {
        universityName: univ,
        sports: [],
        totalSports: 0,
        totalAthletes: 0,
        totalLinkedInProfiles: 0,
        totalRosters: 0,
        firstYear: Infinity, // will keep track of min year
        lastYear: -Infinity, // will keep track of max year
      };
    }

    grouped[univ].sports.push(item);
  });

  // compute the totals for each university
  Object.values(grouped).forEach((univData: any) => {
    univData.sports.forEach((sportItem: any) => {
      // Increment the totalSports count for each sport entry
      univData.totalSports += 1;

      univData.totalAthletes += sportItem.num_total;

      univData.totalLinkedInProfiles += sportItem.num_found;

      univData.totalRosters += sportItem.num_rosters;

      const fy = parseInt(sportItem.first_roster, 10);
      const ly = parseInt(sportItem.max_roster, 10);

      if (fy < univData.firstYear) {
        univData.firstYear = fy;
      }
      if (ly > univData.lastYear) {
        univData.lastYear = ly;
      }
    });

    // Convert Infinity / -Infinity to something readable if needed
    if (univData.firstYear === Infinity) univData.firstYear = 0;
    if (univData.lastYear === -Infinity) univData.lastYear = 0;
  });

  return Object.values(grouped);
};
