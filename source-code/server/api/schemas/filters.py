from typing import Optional
from pydantic import BaseModel


class DashboardFilters(BaseModel):
    """
    Defines filters selected by user on dashboard
    """

    hcpcs_class: Optional[list[str]]
    hcpcs_category: Optional[list[str]]
    hcpcs_sub_category: Optional[list[str]]
    hcpcs_code: Optional[list[str]]
