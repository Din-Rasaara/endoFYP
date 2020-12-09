import pandas
#import serial
import time
import datetime
from random import random
from pymongo import MongoClient
import json
from bson.objectid import ObjectId

# Configuration
serial_port = '/dev/ttyACM0'
mongodb_host = 'mongodb://localhost'
mongodb_db = 'testdb'

# Connect to Serial Port for communication
# ser = serial.Serial(serial_port, 9600, timeout=0)


# Connect to MongoDB
client = MongoClient(mongodb_host, 27017)
db = client[mongodb_db]
collection = db['testc']

sessionId = ObjectId("5fca07c621e4b326bc364611")

fixed_interval = 0.1
print(client, collection)

csv_file1 ='ReadingCombinedPressure.csv' 
#csv_file2 ='ReadingCombinedIMP.csv'; 
pressureData = pandas.read_csv(csv_file1, header=None)
#print(pData)
#tempData=pandas.read_csv(csv-file2,header=None)
for index, row in pressureData.iterrows():
    # while 1:
    try:
        # Temperature value obtained from Arduino
        # temp_string = ser.readline().rstrip()
        temp_string = 1
        temp = {'time_stamp': row[0], 'value': row[2]}
        pressure = {'time_stamp': row[0], 'value': row[1]}

        # If we received a measurement, print it and send it to MongoDB.
        if temp_string:
            doc = collection.find_one({'_id': sessionId})
            # doc_id = collection.update_one(
            #     {'_id': sessionId}, {'$push': {'Pressure': pressure}})

            doc_id = collection.update_one(
                 {'_id': sessionId}, {'$push': {'Pressure': pressure, 'Temperature': temp}})
            print("updated", index)
    except ValueError:
        print("some eror")
    finally:
        time.sleep(fixed_interval)
