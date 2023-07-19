from fastapi import FastAPI
from typing import Union

import mysql.connector

db = mysql.connector.connect(
  host="localhost",
  user="root",
  password="Stephen233",
  database="voder"
)

mycursor = db.cursor(buffered=True)


app = FastAPI()             

@app.post("/log")
def read_item(content: Union[str, None] = None):
    mycursor.execute("INSERT INTO log (content) VALUES ('%s')"%content)
    db.commit()
    return