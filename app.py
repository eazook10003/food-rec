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
from sklearn.preprocessing import OneHotEncoder
from scipy.spatial.distance import hamming
from collections import Counter

MONGO_URI = "mongodb://localhost:27017"

app = Flask(__name__)
CORS(app)

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)
db = client['react-login-tut']
collection = db['collection']
preferences_collection = db['preferences']

def one_hot_encode(df):
    encoder = OneHotEncoder(sparse=False)
    encoded_df = encoder.fit_transform(df[['temp', 'time']])
    return encoded_df, encoder

def hamming_distance(instance1, instance2):
    return hamming(instance1, instance2)

def knn_predict(df, query, k=4):
    encoded_df, encoder = one_hot_encode(df)
    query_df = pd.DataFrame([query], columns=['temp', 'time'])
    query_encoded = encoder.transform(query_df).tolist()[0]
    distances = [hamming_distance(row, query_encoded) for row in encoded_df]
    k_indices = np.argsort(distances)[:k]
    k_labels = [df.iloc[i]['dishName'] for i in k_indices]
    num_labels = 4 
    most_common = Counter(k_labels).most_common(num_labels)
    return [label[0] for label in most_common]

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
    features = list(df.columns)[:-1]
    prior = calculate_prior(df, Y)

    Y_pred = []
    for x in X:
        labels = sorted(list(df[Y].unique()))
        likelihood = [1]*len(labels)
        for j in range(len(labels)):
            for i in range(len(features)):
                likelihood[j] *= calculate_likelihood_categorical(df, features[i], x[i], Y, labels[j])

        post_prob = [1]*len(labels)
        for j in range(len(labels)):
            post_prob[j] = likelihood[j] * prior[j]

        top3_indices = np.argsort(post_prob)[-4:]

        top3_indices = top3_indices[::-1]

        labels = sorted(list(df[Y].unique()))
        top3_labels = [labels[i] for i in top3_indices]

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

    X_test_K = [a, b]

    predicted_dish_knn = knn_predict(df, X_test_K, k=4)
    predicted_dish_naive_bayes = naive_bayes_categorical(df, X=X_test, Y="dishName")
    print("naive: ", predicted_dish_naive_bayes)
    print("KNN: ", predicted_dish_knn)
    # Flatten the Naive Bayes predictions
    predicted_dish_naive_bayes = [item for sublist in predicted_dish_naive_bayes for item in sublist]

    # Find common dishes and their counts
    common_dishes = set(predicted_dish_knn) & set(predicted_dish_naive_bayes)
    dish_counts = {dish: min(predicted_dish_knn.count(dish), predicted_dish_naive_bayes.count(dish)) for dish in common_dishes}
    print("dish_count: ", dish_counts)
    # Sort dishes by their counts
    ranked_dishes = sorted(dish_counts, key=dish_counts.get, reverse=True)
    print("ranked dish: ",ranked_dishes)
    return ranked_dishes



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
    if isinstance(prediction, tuple):  # Checking if it's an error message
        return jsonify({"error": prediction[0]}), 404

    return jsonify({"prediction": prediction}), 200


@app.route("/collectPreferences", methods=['POST'])
def collect_preferences():
    responses = request.json.get('responses')  # Changed 'answers' to 'responses'
    email = request.json.get('userId')
    user = collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found123"}), 404

    user_id = user['_id']

    for response in responses:
        dish_name = response['dishName']
        warmth = response['temp']
        time = response['time']
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

if __name__ == "__main__":
    app.run(port=8000)
