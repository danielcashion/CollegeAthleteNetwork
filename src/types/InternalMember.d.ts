export interface InternalMember {
  admin_id: string;
  email_address: string;
  password: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
}

export interface InternalEmailTemplate {
  template_id: string;
  template_name: string;
  template_description: string;
  template_creator: string;
  template_task: string;
  template_params: string;
  template_html: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_by: string | null;
  updated_datetime: string | null;
}
