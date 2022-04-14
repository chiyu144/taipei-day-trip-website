import re
from datetime import datetime

def email_validation(email):
  email_format: str = r"\S+@\S+\.\S+"
  return True if re.match(email_format, str(email), re.IGNORECASE) else False

def password_validation(password):
  # 8 ~ 16 位英數字及特殊符號，至少包含 1 位數字 + 1 位特殊符號 (!@#$%^&* 擇一)
  password_format: str = r"^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$"
  return True if re.match(password_format, str(password), re.IGNORECASE) else False

def phone_validation(phone):
  # 台灣手機號碼
  phone_format: str = r"^[09]{2}\d{8}$"
  return True if re.match(phone_format, str(phone)) else False

def name_validation(name):
  # 中文名字，2 ~ 5 字
  name_format: str = r"^[\u4e00-\u9fa5]{2,5}$"
  return True if re.match(name_format, str(name)) else False

def date_validation(date):
  # YYYY-DD-MM
  return True if date == datetime.strptime(date, "%Y-%m-%d").strftime('%Y-%m-%d') else False
