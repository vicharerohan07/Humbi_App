from typing import Optional
from pydantic import BaseModel


class DashboardFilters(BaseModel):
    """
    Defines filters selected by user on dashboard
    """

    hcpcs_class: Optional[list[str] | list[dict[str, str]]]
    hcpcs_category: Optional[list[str] | list[dict[str, str]]]
    hcpcs_sub_category: Optional[list[str] | list[dict[str, str]]]
    hcpcs_code: Optional[list[str] | list[dict[str, str]]]
    hcpcs_code_description: Optional[list[str] | list[dict[str, str]]]
    loc_state: Optional[list[str] | list[dict[str, str]]]
    loc_county: Optional[list[str] | list[dict[str, str]]]
    loc_city: Optional[list[str] | list[dict[str, str]]]
    loc_zipcode: Optional[list[str] | list[dict[str, str]]]
    org_npi: Optional[list[str] | list[dict[str, str]]]
    org_name: Optional[list[str] | list[dict[str, str]]]
    physician_npi: Optional[list[str] | list[dict[str, str]]]
    physician_name: Optional[list[str] | list[dict[str, str]]]
    physician_speciality: Optional[list[str] | list[dict[str, str]]]
    threshold: Optional[float] = 1.0
