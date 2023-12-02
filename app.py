from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps
import requests, json
from bs4 import BeautifulSoup
from bson import ObjectId
from datetime import datetime
import pandas as pd
import numpy as np 
from sklearn.model_selection import train_test_split
from flask import session

MONGO_URI = "mongodb://localhost:27017"

app = Flask(__name__)
CORS(app)

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)
db = client['react-login-tut']
collection = db['collection']
preferences_collection = db['preferences']

def calculate_prior(df, Y):
    classes = sorted(list(df[Y].unique()))
    prior = []
    for i in classes:
        prior.append(len(df[df[Y]==i])/len(df))
    return prior

def calculate_likelihood_categorical(df, feat_name, feat_val, Y, label):
    feat = list(df.columns)
    df = df[df[Y]==label]
    p_x_given_y = len(df[df[feat_name]==feat_val]) / len(df)
    return p_x_given_y

def naive_bayes_categorical(df, X, Y):
    # get feature names
    features = list(df.columns)[:-1]

    # calculate prior
    prior = calculate_prior(df, Y)

    Y_pred = []
    # loop over every data sample
    for x in X:
        # calculate likelihood
        labels = sorted(list(df[Y].unique()))
        likelihood = [1]*len(labels)
        for j in range(len(labels)):
            for i in range(len(features)):
                likelihood[j] *= calculate_likelihood_categorical(df, features[i], x[i], Y, labels[j])

        # calculate posterior probability (numerator only)
        post_prob = [1]*len(labels)
        for j in range(len(labels)):
            post_prob[j] = likelihood[j] * prior[j]

        top3_indices = np.argsort(post_prob)[-4:]  # This gives indices of top 3 values

        # Reverse the indices (so they are in the order of highest probability first)
        top3_indices = top3_indices[::-1]

        # Get corresponding labels for these indices
        labels = sorted(list(df[Y].unique()))
        top3_labels = [labels[i] for i in top3_indices]

        # Append these labels to Y_pred
        Y_pred.append(top3_labels)

    return np.array(Y_pred)

def get_part_of_day(h):
    if 5 <= h <= 11:
        return "Morning"
    elif 11 < h <= 17:
        return "Afternoon"
    else:
        return "Evening"

def get_temp_of_day(c):
    if  c >= 30:
        return "Hot"
    elif 15 <= c < 30:
        return "Warm"
    else:
        return "Cold"

def export_predict(user_email, a, b):
    # 데이터 베이스에서 해당 유저 email을 이용해 user_id 찾기
    user = collection.find_one({"email": user_email})
    if not user:
        return "User not found1234412", 404

    user_id = user['_id']

    # 찾은 user_id로 해당 training 데이터
    cursor = preferences_collection.find({"userId": user_id})
    user_preferences = list(cursor)
    preferences_data = [pref for doc in user_preferences for pref in doc.get('preferences', [])]
    if not preferences_data:
        return "No preferences data found for user", 404

    # Create a DataFrame
    df = pd.DataFrame(preferences_data)

    # 직접 feature 인풋 지정  
    # 예시)
    # X_test = [ 
    #     ["Cold", "Morning"],  
    #     ["Cold", "Evening"], 
    # ]

    X_test = [
        [a, b],  # The input features for prediction
    ]

    Y_pred = naive_bayes_categorical(df, X=X_test, Y="dishName")
    return Y_pred.tolist()



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

@app.route("/Cook", methods=['POST'])
def food_info():
    name = request.get_json('dishName')
    dish_name = name['name']
    url = f"https://www.10000recipe.com/recipe/list.html?q={dish_name}"
    response = requests.get(url)
    if response.status_code == 200:
        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
    else : 
        print("HTTP response error :", response.status_code)
        return
    
    food_list = soup.find_all(attrs={'class':'common_sp_link'})
    food_id = food_list[0]['href'].split('/')[-1]
    new_url = f'https://www.10000recipe.com/recipe/{food_id}'
    new_response = requests.get(new_url)
    if new_response.status_code == 200:
        html = new_response.text
        soup = BeautifulSoup(html, 'html.parser')
    else : 
        print("HTTP response error :", response.status_code)
        return
    
    food_info = soup.find(attrs={'type':'application/ld+json'})
    result = json.loads(food_info.text)
    ingredient = ','.join(result['recipeIngredient'])
    recipe = [result['recipeInstructions'][i]['text'] for i in range(len(result['recipeInstructions']))]
    for i in range(len(recipe)):
        recipe[i] = f'{i+1}. ' + recipe[i]
    
    res = {
        'name': name,
        'ingredients': ingredient,
        'recipe': recipe
    }
    #print(res)
    return res

@app.route("/submitDetails", methods=['POST'])
def submit_details():
    data = request.json
    email = data.get('userId')

    user = collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found123"}), 404

    user_id = user['_id']
    temp = data.get('weather')
    dish_name = data.get('name')
    now = datetime.now()
    current_time = now.strftime("%H")
    time = get_part_of_day(int(current_time)) # 시간을 오전 오후 저녁으로 분휴
    warmth = get_temp_of_day(temp) # 온도 수치를 따뜻함 추움 더움으로 분류

    # 시간, 날씨, 음식 정보를 해당 유저의 데이터베이스에 저장 (collection 말고 preference로 이름 되어있음)
    update_result = preferences_collection.update_one(
        {"userId": user_id},
        {
            "$push": {
                "preferences": {
                    "temp": warmth,
                    "time": time,
                    "dishName": dish_name
                }
            }
        },
        upsert=True
    )
    if update_result.modified_count or update_result.upserted_id:
        return jsonify({"message": "Details updated successfully"}), 200
    else:
        return jsonify({"error": "Update failed"}), 500


@app.route("/predict", methods=['POST'])
def predict():
    data = request.json
    email = data.get('userId')
    temp = data.get('weather')
    now = datetime.now()
    current_time = now.strftime("%H")
    time = get_part_of_day(int(current_time))
    warmth = get_temp_of_day(temp)
    prediction = export_predict(email, warmth, time)
    print("prediction: ", prediction)
    if isinstance(prediction, tuple):  # Checking if it's an error message
        return jsonify({"error": prediction[0]}), 404

    return jsonify({"prediction": prediction}), 200




if __name__ == "__main__":
    app.run(port=8000)
