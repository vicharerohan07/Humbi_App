from functools import lru_cache
from pathlib import Path
from typing import Any
import pandas as pd
from api.schemas.filters import DashboardFilters


def _build_query(*, type: str, filters: list[str]) -> str:
    """
    Builds query based on filters
    """
    match type:

        case "hcpcs_class":
            return f"HCPCS_Class in {filters}" if filters else ""

        case "hcpcs_subclass":
            return f"HCPCS_Subclass in {filters}" if filters else ""

        case "hcpcs_subsubclass":
            return f"HCPCS_Subsubclass in {filters}" if filters else ""

        case _:
            raise ValueError(f"Invalid type: {type}")


@lru_cache(maxsize=None)
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

    hcpcs_subsubclass_query: str = _build_query(
        type="hcpcs_subsubclass", filters=dashboard_filters.hcpcs_sub_category
    ).strip()

    filter_query: str = "&".join(
        [
            filter
            for filter in [
                hcpcs_class_query,
                hcpcs_subclass_query,
                hcpcs_subsubclass_query,
            ]
            if filter
        ]
    )

    if filter_query:
        dataframe = dataframe.query(filter_query)

    return dataframe


def prepare_dashboard(*, dataframe: pd.DataFrame) -> dict[str, Any]:
    """
    Prepares dataframe for dashboard

    :param dataframe: dataframe to prepare
    :type dataframe: pd.DataFrame

    :return: prepared dataframe
    :rtype: pd.DataFrame
    """

    final_op: pd.DataFrame = (
        dataframe.groupby(
            ["NPI_DOC", "PFNAME", "ORG_NAME", "DOC_SPECIALTY", "DOC_CITY", "DOC_STATE"]
        )
        .sum()
        .reset_index()
    )

    aggregated_op = []
    for _, row in final_op.iterrows():
        result = {
            "Physician NPI": row["NPI_DOC"],
            "Physician": row["PFNAME"],
            "Org Name": row["ORG_NAME"],
            "Speciality": row["DOC_SPECIALTY"],
            "City": row["DOC_CITY"],
            "State": row["DOC_STATE"],
            "ASC": row["SRVS_ASC_PHY"],
            "IP": row["SRVS_IP_PHY"],
            "OP": row["SRVS_OP_PHY"],
            "OFFICE": row["SRVS_OFF"],
            "Total": sum(
                [
                    row["SRVS_ASC_PHY"],
                    row["SRVS_IP_PHY"],
                    row["SRVS_OP_PHY"],
                    row["SRVS_OFF"],
                ]
            ),
        }
        aggregated_op.append(result)

    return aggregated_op
