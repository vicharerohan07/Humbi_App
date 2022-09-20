from pathlib import Path
from typing import Any
import pandas as pd
from api.schemas.filters import DashboardFilters


def _build_query(*, type: str, filters: list[str]) -> str:
    """
    Builds query based on filters
    """
    filters = [filter.capitalize() for filter in filters]

    match type:
        case "hcpcs_class":
            return f"hcpcs_class in {filters}" if filters else ""

        case "hcpcs_subclass":
            return f"hcpcs_subclass in {filters}" if filters else ""

        case "hcpcs_group":
            return f"hcpcs_group in {filters}" if filters else ""

        case "hcpcs_code_description":
            return f"hcpcs_code_description in {filters}" if filters else ""

        case "hcpcs_code":
            return f"hcpcs_code in {filters}" if filters else ""

        case "loc_state":
            return f"doc_state in {filters}" if filters else ""

        case "loc_county":
            return f"doc_county in {filters}" if filters else ""

        case "loc_city":
            return f"doc_city in {filters}" if filters else ""

        case "loc_zipcode":
            return f"doc_zip in {filters}" if filters else ""

        case "org_npi":
            return f"npi_org in {filters}" if filters else ""

        case "org_name":
            return f"org_name in {filters}" if filters else ""

        case "physician_npi":
            return f"npi_doc in {filters}" if filters else ""

        case "physician_name":
            return f"phy_name in {filters}" if filters else ""

        case "physician_speciality":
            return f"doc_specialty in {filters}" if filters else ""

        case _:
            raise ValueError(f"Invalid type: {type}")


def get_hcpcs_data(*, data_path: str) -> pd.DataFrame:
    """
    Reads hcpcs data,meta-data,raw-data from csv file
    This is one time activity

    :param data_path: path to csv file
    :type data_path: str

    :return: dataframe of hcpcs data
    :rtype: pd.DataFrame
    """
    data_dir_path: str = Path(data_path).absolute()
    hcpcs_mapping = pd.read_csv(f"{data_dir_path}/hcpcs_mapping.csv")
    doc_mapping = pd.read_csv(f"{data_dir_path}/doc_mapping.csv")
    hcpcs_raw_data = pd.read_csv(f"{data_dir_path}/hcpcs_raw_data.csv")

    combined_df: pd.DataFrame = doc_mapping.merge(
        hcpcs_raw_data,
        how="inner",
        left_on="NPI_DOC",
        right_on="NPI_DOC",
        suffixes=["_doc_mapping,", "hcpcs_raw_data"],
    )

    final_df = combined_df[
        [
            "NPI_DOC",
            "PFNAME",
            "ORG_NAME",
            "DOC_SPECIALTY",
            "DOC_CITY",
            "DOC_STATE",
            "SRVS_ASC_PHY",
            "SRVS_IP_PHY",
            "SRVS_OFF",
            "SRVS_OP_PHY",
            "HCPCS Code",
        ]
    ]

    final_df_with_hcpcs = final_df.merge(
        hcpcs_mapping,
        how="inner",
        left_on="HCPCS Code",
        right_on="HCPCS Code",
        suffixes=["_final_df", "_hcpcs_mapping"],
    )

    final_df_with_hcpcs.columns = final_df_with_hcpcs.columns.str.replace(" ", "_")

    return final_df_with_hcpcs


def filter_dataframe(
    *, dataframe: pd.DataFrame, dashboard_filters: DashboardFilters
) -> pd.DataFrame:
    """
    Filters dataframe based on filters

    :param dataframe: dataframe to filter
    :type dataframe: pd.DataFrame

    :param filters: filters to apply
    :type filters: dict

    :return: filtered dataframe
    :rtype: pd.DataFrame
    """

    hcpcs_class_query: str = _build_query(
        type="hcpcs_class", filters=dashboard_filters.hcpcs_class
    )

    hcpcs_subclass_query: str = _build_query(
        type="hcpcs_subclass", filters=dashboard_filters.hcpcs_category
    ).strip()

    hcpcs_group_query: str = _build_query(
        type="hcpcs_group", filters=dashboard_filters.hcpcs_sub_category
    ).strip()

    hcpcs_code: str = _build_query(
        type="hcpcs_code", filters=dashboard_filters.hcpcs_code
    ).strip()

    hcpcs_code_description: str = _build_query(
        type="hcpcs_code_description", filters=dashboard_filters.hcpcs_code_description
    )

    loc_state: str = _build_query(
        type="loc_state", filters=dashboard_filters.loc_state
    ).strip()

    loc_city: str = _build_query(
        type="loc_city", filters=dashboard_filters.loc_city
    ).strip()

    loc_county: str = _build_query(
        type="loc_county", filters=dashboard_filters.loc_county
    ).strip()

    loc_zipcode: str = _build_query(
        type="loc_zipcode", filters=dashboard_filters.loc_zipcode
    ).strip()

    org_npi: str = _build_query(
        type="org_npi", filters=dashboard_filters.org_npi
    ).strip()

    org_name: str = _build_query(
        type="org_name", filters=dashboard_filters.org_name
    ).strip()

    physician_npi: str = _build_query(
        type="physician_npi", filters=dashboard_filters.physician_npi
    ).strip()

    physician_name: str = _build_query(
        type="physician_name", filters=dashboard_filters.physician_name
    ).strip()

    physician_speciality: str = _build_query(
        type="physician_speciality", filters=dashboard_filters.physician_speciality
    ).strip()

    filter_query: str = "&".join(
        [
            filter
            for filter in [
                hcpcs_class_query,
                hcpcs_subclass_query,
                hcpcs_group_query,
                hcpcs_code,
                hcpcs_code_description,
                loc_state,
                loc_city,
                loc_county,
                loc_zipcode,
                org_npi,
                org_name,
                physician_npi,
                physician_name,
                physician_speciality,
            ]
            if filter
        ]
    )

    if filter_query:
        dataframe = dataframe.query(filter_query)

    return dataframe


def prepare_dashboard(*, dataframe: pd.DataFrame, **kwargs) -> dict[str, Any]:
    """
    Prepares dataframe for dashboard

    :param dataframe: dataframe to prepare
    :type dataframe: pd.DataFrame

    :return: prepared dataframe
    :rtype: pd.DataFrame
    """

    final_op: pd.DataFrame = dataframe.groupby(
        [
            "year",
            "hcpcs_code_description",
            "npi_doc",
            "hcpcs_group",
            "hcpcs_class",
            "hcpcs_subclass",
            "doc_specialty",
            "doc_city",
            "doc_state",
            "doc_zip",
            "doc_county",
            "npi_org",
            "org_name",
            "phy_name",
        ]
    ).agg(
        {
            "total_savings": "sum",
            "op_fac_unit_cost": "sum",
            "asc_fac_unit_cost": "sum",
            "srvs_asc_phy": "sum",
            "srvs_asc_fac": "sum",
            "srvs_ip_phy": "sum",
            "srvs_off": "sum",
            "srvs_op_phy": "sum",
            "srvs_op_fac": "sum",
        }
    )
    final_op.reset_index(inplace=True)

    filter_formatter = lambda x: {"label": str(x), "value": str(x)}
    aggregated_op = []
    threshold = kwargs.get('threshold',1)

    for _, row in final_op.iterrows():
        result = {
            "year": row["year"],
            "npi_doc": row["npi_doc"],
            "hcpcs_code_description": row["hcpcs_code_description"],
            "hcpcs_group": row["hcpcs_group"],
            "doc_specialty": row["doc_specialty"],
            "loc_city": row["doc_city"],
            "loc_state": row["doc_state"],
            "loc_zip": row["doc_zip"],
            "loc_county": row["doc_county"],
            "npi_org": row["npi_org"],
            "org_name": row["org_name"],
            "phy_name": row["phy_name"],
            "op_fac_unit_cost": row["op_fac_unit_cost"],
            "asc_fac_unit_cost": row["asc_fac_unit_cost"],
            "srvs_asc_phy": row["srvs_asc_phy"],
            "srvs_asc_fac": row["srvs_asc_fac"],
            "srvs_ip_phy": row["srvs_ip_phy"],
            "srvs_off": row["srvs_off"],
            "srvs_op_phy": row["srvs_op_phy"],
            "srvs_op_fac": row["srvs_op_fac"],
            "total": int(row["srvs_asc_phy"]) + int(row["srvs_ip_phy"]) + int(row["srvs_off"]) + int(row["srvs_op_phy"]),
            "total_savings": row["total_savings"]*threshold,
        }
        aggregated_op.append(result)

    data = aggregated_op
    filters = DashboardFilters(
        hcpcs_class=[
            filter_formatter(val) for val in dataframe["hcpcs_class"].unique().tolist()
        ],
        hcpcs_category=[
            filter_formatter(val)
            for val in dataframe["hcpcs_subclass"].unique().tolist()
        ],
        hcpcs_code_description=[
            filter_formatter(val)
            for val in dataframe["hcpcs_code_description"].unique().tolist()
        ],
        hcpcs_sub_category=[
            filter_formatter(val) for val in dataframe["hcpcs_group"].unique().tolist()
        ],
        hcpcs_code=[
            filter_formatter(val) for val in dataframe["hcpcs_code"].unique().tolist()
        ],
        loc_city=[
            filter_formatter(val) for val in dataframe["doc_city"].unique().tolist()
        ],
        loc_state=[
            filter_formatter(val) for val in dataframe["doc_state"].unique().tolist()
        ],
        loc_zipcode=[
            filter_formatter(val) for val in dataframe["doc_zip"].unique().tolist()
        ],
        loc_county=[
            filter_formatter(val) for val in dataframe["doc_county"].unique().tolist()
        ],
        org_name=[
            filter_formatter(val) for val in dataframe["org_name"].unique().tolist()
        ],
        org_npi=[
            filter_formatter(val) for val in dataframe["npi_org"].unique().tolist()
        ],
        physician_name=[
            filter_formatter(val) for val in dataframe["phy_name"].unique().tolist()
        ],
        physician_npi=[
            filter_formatter(val) for val in dataframe["npi_doc"].unique().tolist()
        ],
        physician_speciality=[
            filter_formatter(val)
            for val in dataframe["doc_specialty"].unique().tolist()
        ],
        threshold=threshold
    )
    return {"data": data, "filters": filters}


def get_redis_key(*, filters: DashboardFilters):
    """
    Builds redis key based on filters

    :param filters: filters to apply
    :type filters: dict

    :return: redis key
    :rtype: str
    """

    seleceted_filters = [
        filter
        for filter in [
            filters.hcpcs_category,
            filters.hcpcs_class,
            filters.hcpcs_code,
            filters.hcpcs_sub_category,
        ]
        if len(filter) > 0
    ]

    redis_key = "_".join(list(itertools.chain(*seleceted_filters)))

    return redis_key
