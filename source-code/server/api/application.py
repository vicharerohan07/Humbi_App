from fastapi import FastAPI


app = FastAPI(
    debug=True,
    title="Humbi API",
    description="""
        This service generates dashboard reports for humbi users.
    """,
    version="1.0",
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
    openapi_tags=[
        {
            "name": "humbi service",
            "description": """
                Provides APIs related to humbi reporting. 
            """,
        }
    ],
)
