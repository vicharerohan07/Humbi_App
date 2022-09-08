from api.application import app
from api.schemas.filters import DashboardFilters
from utils import helpers


@app.post("/category-dashboard", tags=["humbi service"])
async def dashboard(dashboard_filters: DashboardFilters):
    """
    Returns dashboard data
    """
    # hcpcs_dashboard_raw_data: pd.DataFrame = helpers.get_hcpcs_data(
    #     data_path="./data/documents"
    # )

    # filterd_df: pd.DataFrame = helpers.filter_dataframe(
    #     dataframe=hcpcs_dashboard_raw_data, dashboard_filters=dashboard_filters
    # )

    return helpers.prepare_dashboard(
        dataframe=helpers.filter_dataframe(
            dataframe=helpers.get_hcpcs_data(data_path="./data/documents"),
            dashboard_filters=dashboard_filters,
        )
    )
