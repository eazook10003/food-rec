from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps
import requests, json
from bs4 import BeautifulSoup

# test2
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

@app.route("/Cook", methods=['POST'])
def food_info():
    name = request.get_json('dishName')
    #name = request_data['name']
    #request_data = request.json.get('dishName')
    #print("@@@@@@@@@@", request_data)
    #name = request_data['name']
    '''
    This function gives you food information for the given input.

    PARAMETERS
        - name(str): name of Korean food in Korean ex) food_info("김치찌개")
    RETURN
        - res(list): list of dict that containing info for some Korean food related to 'name'
            - res['name'](str): name of food
            - res['ingredients'](str): ingredients to make the food
            - res['recipe'](list[str]): contain recipe in order
    '''
    
    url = f"https://www.10000recipe.com/recipe/list.html?q={name}"
    
    
    print("URL:@@@@@@@@: ", url)
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
    

if __name__ == "__main__":
    app.run(port=8000)
