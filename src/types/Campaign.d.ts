export interface CampaignData {
  campaign_id: string;
  campaign_name: string;
  campaign_desc?: string;
  university_name: string;
  member_id: string;
  campaign_type: string;
  event_id?: string;
  aws_configuration_set: string;
  campaign_filters?: string;
  is_scheduled_YN?: number;
  scheduled_datetime?: string;
  audience_size?: string;
  audience_emails?: string;
  campaign_title?: string;
  email_from_name?: string;
  email_from_address?: string;
  reply_to_address?: string;
  email_subject?: string;
  email_pre_header_text?: string;
  email_body?: string;
  campaign_template_id?: string;
  campaign_status?: string;
  status_message?: string;
  include_logo_YN?: number;
  university_colors_YN?: number;
  one_way_two_way?: number;
  send_datetime?: string;
  in_library_YN?: number;
  is_active_YN?: number;
  created_by?: string;
  created_datetime?: string;
  updated_by?: string;
  updated_datetime?: string;
  attachments_url?: string;
  editor_type?: string;
}

export interface CampaignTemplate {
  campaign_template_id?: string;
  campaign_type: string;
  university_name?: string | null;
  member_id?: string | null;
  campaign_title: string;
  email_body?: string;
  email_from_name: string;
  email_from_address: string;
  reply_to_address?: string | null;
  email_subject: string;
  response_type?: string | null;
  response_options?: string | null;
  is_systemwide_YN?: number;
  is_active_YN?: number;
  created_by?: string;
  created_datetime?: string;
  updated_by?: string | null;
  updated_datetime?: string | null;
  editor_type?: string;
}

export interface EmailRecipientData {
  athlete_name: string;
  max_roster_year: number;
  sport: string;
  gender_id: number;
  email_address: string;
  correlation_id: string;
  university_name: string;
}
