import json
from flask import current_app
from mysql.connector import Error

def attractions_values(attractions):
  values = []
  for row in attractions:
    cols = [row['_id'], row['stitle'], row['CAT2'], row['xbody'], row['address'],
            row['info'], row['MRT'], row['latitude'], row['longitude'], row['MEMO_TIME']]
    values.append(tuple(cols))
  return values

def insert_attractions(attractions):
  cnx = current_app.db_cnx()
  cursor = cnx.cursor()
  try:
    sql = """
        INSERT INTO attractions (id, name, category, description, address, transport, mrt, latitude, longitude, memo_time) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
      """
    cursor.executemany(sql, attractions_values(attractions))
    cnx.commit()
  except Error as e:
    print('MySql Connection Pool Execution error: ', e)
  finally:
    cursor.close()
    cnx.close()

def attractions_imgs(attractions):
  img_urls = []
  for row in attractions:
    files = row["file"].split("https://")[1:]
    for index, file in enumerate(files):
      file = "https://" + file[:-3] + file[-3:].lower()
      files[index] = file
      if file[-3:] == "jpg" or file[-3:] == "png":
        img_urls.append((row["_id"], files[index]))
  return img_urls

def insert_attractions_imgs(attractions):
  cnx = current_app.db_cnx()
  cursor = cnx.cursor()
  try:
    sql = "INSERT INTO attractions_imgs (attraction_id, img_url) VALUES (%s, %s)"
    cursor.executemany(sql, attractions_imgs(attractions))
    cnx.commit()
  except Error as e:
    print('MySql Connection Pool Execution error: ', e)
  finally:
    cursor.close()
    cnx.close()

def tpe_attractions(json_path):
  with open(f"{json_path}", encoding="utf-8") as input:
    data = json.load(input)
    attractions = data["result"]["results"]
    insert_attractions(attractions)
    insert_attractions_imgs(attractions)
