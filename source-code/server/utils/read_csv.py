import pandas as pd


class reading_Csv:
    def read_hcpcs_metadata():
        hcpcs_metadata = pd.read_csv(
            "D:\\New folder\\Humbi_App\\documents\\HCPCS Mapping.csv", delimiter=","
        )
        return hcpcs_metadata

    def read_npi_metadata():
        npi_metadata = pd.read_csv(
            "D:\\New folder\\Humbi_App\\documents\\Doc Mapping.csv", delimiter=","
        )
        return npi_metadata

    def read_raw_data():
        raw_data = pd.read_csv(
            "D:\\New folder\\Humbi_App\\documents\\HCPCS Raw Data.csv", delimiter=","
        )
        return raw_data
