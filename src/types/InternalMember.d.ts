export interface InternalMember {
  admin_id: string;
  email_address: string;
  password: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
}

export interface InternalEmailTemplate {
  campaign_template_id: string;
  campaign_type?: string | null;
  template_title?: string;
  template_description?: string;
  template_creator?: string;
  template_task?: string;
  template_params?: string;
  email_body: string;
  email_from_name?: string | null;
  email_from_address?: string | null;
  reply_to_address?: string | null;
  email_subject?: string | null;
  response_type?: string | null;
  response_options?: string | null;
  is_systemwide_YN?: number | null;
  is_active_YN?: number | null;
  created_by?: string;
  created_datetime?: string;
  updated_by?: string | null;
  updated_datetime?: string | null;
}
