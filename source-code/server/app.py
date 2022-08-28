from fastapi import FastAPI
import uvicorn
import read_csv
app = FastAPI()

req_sample = {
  "hcpcs_class" : ["Cardiology"],
  "hcpcs_category" : [],
  "hcpcs_subCategory" : [],
  "hcpcs_code" : []
}
@app.get("/")
def home():
  return {
      "Hello Humbi Analytics"
  }
@app.get("/hcpcs_metadata")
def get_hcpcs_metadata():
  hcpcs_metadata = read_csv.reading_Csv.read_hcpcs_metadata()
  print(hcpcs_metadata.columns)
  return "hcpcs_metadata"

@app.get("/get_dashboard_data")
def get_dashboard_data():
  
  return "returned"
# other stuff
if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, debug = True)