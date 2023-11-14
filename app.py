from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps

# Configuration
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
        user = collection.find_one({"email": email, "password": password})
        if user:
            return jsonify("exist")
        else:
            # This means either the email doesn't exist or the password is wrong
            check_email = collection.find_one({"email": email})
            if check_email:
                return jsonify("wrong-pw")
            else:
                return jsonify("notexist")
    except Exception as e:
        return jsonify("fail")

@app.route("/signup", methods=['POST'])
def signup():
    email = request.json.get('email')
    password = request.json.get('password')
    age = request.json.get('age')
    sex = request.json.get('sex')
    securityQuestion = request.json.get('securityQuestion')
    securityAnswer = request.json.get('securityAnswer')

    try:
        check = collection.find_one({"email": email})
        if check:
            return jsonify("exist")
        else:
            collection.insert_one({"email": email, "password": password, "age": age, "sex": sex, "securityQuestion": securityQuestion, "securityAnswer": securityAnswer})
            return jsonify("notexist")
    except Exception as e:
        return jsonify("fail")

@app.route("/findpw", methods=['POST'])
def findpw():
    email = request.json.get('email')
    securityQuestion = request.json.get('securityQuestion')
    securityAnswer = request.json.get('securityAnswer')

    try:
        user = collection.find_one({"email": email, "securityQuestion": securityQuestion, "securityAnswer": securityAnswer})
        if user:
            collection.update_one({"email": email}, {"$set": {"password": "0000"}})
            return jsonify("confirmed")
        else:
            # This means either the email doesn't exist or the password is wrong
            check_email = collection.find_one({"email": email})
            if check_email:
                return jsonify("wrong")
            else:
                return jsonify("notexist")
    except Exception as e:
        return jsonify("fail")


if __name__ == "__main__":
    app.run(port=8000)
