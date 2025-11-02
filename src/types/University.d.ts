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

export interface University {
  university_id: string;
  university_name: string;
  gender_id: number;
  base_url: string;
  site_provider: string;
  html_type: string;
  num_teams: number;
  num_rosters: number;
  num_athletes: number | null;
  logo_url: string;
  last_update: string;
  sponsor: string | null;
  sponsor_url: string | null;
  accessibility_url: string;
  is_client: number | null;
  primary_hex: string;
  secondary_hex: string;
  tertiary_hex: string;
  is_active_YN: number;
  bank_routing: string | null;
  bank_account_num: string | null;
  created_by: string;
  created_datetime: string;
  updated_by: string | null;
  updated_datetime: string | null;
}
