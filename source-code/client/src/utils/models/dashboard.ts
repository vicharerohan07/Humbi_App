interface IFilters {
  hcpcs_class: string[];
  hcpcs_category: string[];
  hcpcs_sub_category: string[];
  hcpcs_code: string[];
  loc_state: string[];
  loc_county: string[];
  loc_city: string[];
  loc_zipcode: string[];
  org_npi: string[];
  org_name: string[];
  physician_npi: string[];
  physician_name: string[];
  physician_speciality: string[];
}

export type { IFilters };
