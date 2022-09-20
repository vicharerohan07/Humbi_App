from api.application import app
from api.schemas.filters import DashboardFilters
from utils import helpers
import pandas as pd
import pyarrow as pa
import redis


@app.post("/category-dashboard", tags=["humbi service"])
def dashboard(dashboard_filters: DashboardFilters):
    """
    Returns dashboard data
    """
    redis_client = redis.Redis(
        host="server-humbi-cache-1", port=6379, db=0, password=None
    )
    # redis_client = redis.Redis(host="127.0.0.1", port=6379, db=0, password=None)
    context = pa.default_serialization_context()

    # check if data is in cache
    if redis_client.exists("hcpcs_raw_data_join_hcpcs_mapping_npi_doc"):
        hcpcs_raw_data_join_hcpcs_mapping_npi_doc = context.deserialize(
            redis_client.get("hcpcs_raw_data_join_hcpcs_mapping_npi_doc")
        )
        result = helpers.prepare_dashboard(
            dataframe=helpers.filter_dataframe(
                dataframe=hcpcs_raw_data_join_hcpcs_mapping_npi_doc,
                dashboard_filters=dashboard_filters,
            ),
            threshold = dashboard_filters.threshold,
        )
        return result

    # check if data is not in cache
    excel_data = pd.ExcelFile("data/hcpcs_data.xlsx")
    hcpcs_raw_data = pd.read_excel(excel_data, "hcpcs_raw_data", dtype=str)
    doc_mapping = pd.read_excel(excel_data, "doc_mapping", dtype=str)
    hcpcs_mapping = pd.read_excel(excel_data, "hcpcs_mapping", dtype=str)

    column_header_transformation = lambda x: x.replace(" ", "_").lower()

    hcpcs_raw_data.columns = map(column_header_transformation, hcpcs_raw_data.columns)

    doc_mapping.columns = map(column_header_transformation, doc_mapping.columns)
    hcpcs_mapping.columns = map(column_header_transformation, hcpcs_mapping.columns)
    hcpcs_raw_data.drop(
        hcpcs_raw_data.columns[
            hcpcs_raw_data.columns.str.contains("unnamed", case=False)
        ],
        axis=1,
        inplace=True,
    )

    redis_client.set(
        "hcpcs_raw_data", context.serialize(hcpcs_raw_data).to_buffer().to_pybytes()
    )
    redis_client.set(
        "doc_mapping", context.serialize(doc_mapping).to_buffer().to_pybytes()
    )
    redis_client.set(
        "hcpcs_mapping", context.serialize(hcpcs_mapping).to_buffer().to_pybytes()
    )

    hcpcs_raw_data = context.deserialize(redis_client.get("hcpcs_raw_data"))
    doc_mapping = context.deserialize(redis_client.get("doc_mapping"))
    hcpcs_mapping = context.deserialize(redis_client.get("hcpcs_mapping"))

    hcpcs_raw_data_join_hcpcs_mapping = hcpcs_raw_data.merge(
        hcpcs_mapping, on="hcpcs_code"
    )
    hcpcs_raw_data_join_hcpcs_mapping_npi_doc = hcpcs_raw_data_join_hcpcs_mapping.merge(
        doc_mapping, on="npi_doc"
    ).reset_index()

    hcpcs_raw_data_join_hcpcs_mapping_npi_doc[
        "phy_name"
    ] = hcpcs_raw_data_join_hcpcs_mapping_npi_doc[["pfname", "plname"]].apply(
        lambda x: "{} {}".format(x[0], x[1]), axis=1
    )

    hcpcs_raw_data_join_hcpcs_mapping_npi_doc[
        "hcpcs_code_description"
    ] = hcpcs_raw_data_join_hcpcs_mapping_npi_doc[["hcpcs_code", "hcpcs_desc"]].apply(
        lambda x: "{}-{}".format(x[0], x[1]), axis=1
    )

    hcpcs_raw_data_join_hcpcs_mapping_npi_doc = hcpcs_raw_data_join_hcpcs_mapping_npi_doc.applymap(lambda s: s.capitalize() if type(s) == str else s)
    
    hcpcs_raw_data_join_hcpcs_mapping_npi_doc[
        [
            "op_fac_unit_cost",
            "asc_fac_unit_cost",
            "asc_flag",
            "asc_location_flag",
            "srvs_op_fac",
        ]
    ] = hcpcs_raw_data_join_hcpcs_mapping_npi_doc[
        [
            "op_fac_unit_cost",
            "asc_fac_unit_cost",
            "asc_flag",
            "asc_location_flag",
            "srvs_op_fac",
        ]
    ].fillna(
        0.0
    )

    hcpcs_raw_data_join_hcpcs_mapping_npi_doc[
        [
            "op_fac_unit_cost",
            "asc_fac_unit_cost",
            "asc_flag",
            "asc_location_flag",
            "srvs_op_fac",
        ]
    ] = hcpcs_raw_data_join_hcpcs_mapping_npi_doc[
        [
            "op_fac_unit_cost",
            "asc_fac_unit_cost",
            "asc_flag",
            "asc_location_flag",
            "srvs_op_fac",
        ]
    ].astype(
        float
    )
    hcpcs_raw_data_join_hcpcs_mapping_npi_doc["total_savings"] = (
        (
            hcpcs_raw_data_join_hcpcs_mapping_npi_doc["op_fac_unit_cost"]
            - hcpcs_raw_data_join_hcpcs_mapping_npi_doc["asc_fac_unit_cost"]
        )
        * hcpcs_raw_data_join_hcpcs_mapping_npi_doc["asc_flag"]
        * hcpcs_raw_data_join_hcpcs_mapping_npi_doc["asc_location_flag"]
        * hcpcs_raw_data_join_hcpcs_mapping_npi_doc["srvs_op_fac"]
        * dashboard_filters.threshold
    )

    redis_client.set(
        "hcpcs_raw_data_join_hcpcs_mapping_npi_doc",
        context.serialize(hcpcs_raw_data_join_hcpcs_mapping_npi_doc)
        .to_buffer()
        .to_pybytes(),
    )

    return helpers.prepare_dashboard(
        dataframe=helpers.filter_dataframe(
            dataframe=hcpcs_raw_data_join_hcpcs_mapping_npi_doc,
            dashboard_filters=dashboard_filters,
        )
    )
