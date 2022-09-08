import logging
from api import *

LOGGER = logging.getLogger(name=__name__)


#############################
# Load API modules
#############################
LOGGER.info(
    f"""
healthcheck: {health_check}
"""
)
