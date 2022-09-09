interface IFilters {
  hcpcs_class: string[],
  hcpcs_category: string[],
  hcpcs_sub_category: string[],
  hcpcs_code: string[]
}

export type { IFilters };
