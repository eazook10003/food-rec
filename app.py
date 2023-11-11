from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps

# test1
MONGO_URI = "mongodb://localhost:27017"

app = Flask(__name__)
CORS(app)

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)
db = client['react-login-tut']
collection = db['collection']

@app.route("/", methods=['GET'])
def index():
    return jsonify({"message": "Hello, world!"})

@app.route("/", methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    try:
        check_email = collection.find_one({"email": email})
        check_pw = collection.find_one({"password": password})
        if check_email and check_pw:
            return jsonify("exist")
        elif check_email and not check_pw:
            return jsonify("wrong-pw")
        else:
            return jsonify("notexist")
    except Exception as e:
        return jsonify("fail")

@app.route("/signup", methods=['POST'])
def signup():
    email = request.json.get('email')
    password = request.json.get('password')

    try:
        check = collection.find_one({"email": email})
        if check:
            return jsonify("exist")
        else:
            collection.insert_one({"email": email, "password": password})
            return jsonify("notexist")
    except Exception as e:
        return jsonify("fail")

if __name__ == "__main__":
    app.run(port=8000)
