export interface UniversityTeam {
  team_id: string;
  university_id: string;
  gender_id: number;
  university_name: string;
  team_name: string;
  max_roster_year: number | null;
  num_athletes: number;
  url: string;
  sponsor: string | null;
  sponsor_url: string | null;
  sponsor_logo_url: string | null;
  enabled_YN: number;
  last_update: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_by: string | null;
  updated_datetime: string | null;
}
