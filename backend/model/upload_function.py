import boto3,os,uuid
from io import BytesIO
from dotenv import load_dotenv
from .db_connect import mysql_pool

load_dotenv()

access_key = os.getenv("Access_key")
secret_key = os.getenv("Secret_access_key")
AWS_Region = os.getenv("AWS_Region")


class Uploader():
	def __init__(self):
		self.s3 = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=AWS_Region
        )
    
	async def upload_file(self, file, bucket):
		try:
			unique_file_name = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"

			file_content = await file.read()
			
			file_bytes_io = BytesIO(file_content)
			
			self.s3.upload_fileobj(file_bytes_io, bucket, f"text/{unique_file_name}")
			
			file_url = self.get_file_url(bucket, f"text/{unique_file_name}")
			return file_url
		
		except Exception as e:
			print("Upload failed:", e)
			return None

	def get_file_url(self, bucket, key):
		url = f"https://d3v5oek5w3gawn.cloudfront.net/{key}"
		return url
	

class UploadText:
    def __init__(self):

        self.conn = mysql_pool.get_connection()
        self.cursor = self.conn.cursor()

    def create_table(self):
        try:
            create_query = """
            CREATE TABLE IF NOT EXISTS uploads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text VARCHAR(255) NOT NULL,
                file_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
            self.cursor.execute(create_query)
            self.conn.commit()
        except Exception as e:
            print("Failed to create table:", e)
            self.conn.rollback()

    def insert_text(self, text, file_url):
        try:
            insert_query = """
            INSERT INTO uploads (text, file_url)
            VALUES (%s, %s)
            """
            self.cursor.execute(insert_query, (text, file_url))
            self.conn.commit()
        except Exception as e:
            print(f"Error occurred: {e}")
            self.conn.rollback()
        finally:
            pass
    
    @classmethod
    def select(cls):
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            select_query = """
            SELECT id,text, file_url FROM uploads
            ORDER BY id DESC;
            """
            cursor.execute(select_query) 
            data = cursor.fetchall()   
            return data
        
        except Exception as e:
            print("Error during SELECT:", e)
            return []
        
        finally:
            cursor.close()
            conn.close()


    def close(self):
    
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()