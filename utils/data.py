import json
from flask import current_app
from mysql.connector import Error

def attractions_columns(attractions):
  keys = []
  for row in attractions:
    for key in row.keys():
      renamed_key = None
      if key == "info":
        renamed_key = "transport"
      elif key == "stitle":
        renamed_key = "name"
      elif key == "xpostDate":
        renamed_key = "xpost_date"
      elif key == "avBegin":
        renamed_key = "av_begin"
      elif key == "RowNumber":
        renamed_key = "row_num"
      elif key == "CAT1":
        renamed_key = "cat_one"
      elif key == "CAT2":
        renamed_key = "cat_two"
      elif key == "_id":
        renamed_key = "id"
      elif key == "avEnd":
        renamed_key = "av_end"
      else:
        renamed_key = key.lower()
      if renamed_key not in keys and key != 'file':
        keys.append(renamed_key)
  return keys

def attractions_values(attractions):
  values = []
  for row in attractions:
    cols = [row['info'], row['stitle'], row['xpostDate'], row['longitude'], row['REF_WP'],
            row['avBegin'], row['langinfo'], row['MRT'], row['SERIAL_NO'], row['RowNumber'],
            row['CAT1'], row['CAT2'], row['MEMO_TIME'], row['POI'], row['idpt'],
            row['latitude'], row['xbody'], row['_id'], row['avEnd'], row['address']]
    values.append(tuple(cols))
  return values

def insert_attractions(attractions):
  cnx = current_app.db_cnx()
  cursor = cnx.cursor()
  try:
    sql = f"insert into attractions ({', '.join(attractions_columns(attractions))}) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
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
  print(len(img_urls))
  return img_urls

def insert_attractions_imgs(attractions):
  cnx = current_app.db_cnx()
  cursor = cnx.cursor()
  try:
    sql = f"insert into attractions_imgs (attraction_id, img_url) values (%s,%s)"
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
