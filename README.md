Lunch recommendation algorithm
-
This application elevates the predictive accuracy of its recommendation system by synergizing Naive Bayes and K-Nearest Neighbors (KNN) algorithms through sophisticated ensemble learning techniques. To enhance the precision of our predictions, the system initially engages users in a survey composed of nine tailored questions. This preliminary data collection is pivotal for training our algorithms with user-specific preferences.

As users interact with the app, particularly on the 'Cook' page, their choices and searches contribute to an ongoing refinement of their profile. Each interaction is meticulously recorded in our MongoDB database, allowing for a progressively personalized and accurate recommendation experience. This dynamic learning process ensures that the system evolves and adapts to each user's unique culinary preferences over time.

Moreover, we place a strong emphasis on individualized data handling. Each user's data is stored independently, reinforcing the personalization of their experience while upholding data integrity and privacy. This user-centric approach to data collection and analysis is fundamental to delivering bespoke recipe suggestions that resonate more closely with each individual's tastes and cooking preferences.

Pre-requisites and Setup Instructions
-
1. Install the required packages for the frontend and backend. In the "lunch-recommendation" directory, run the following command to set up the frontend:
```
$ npm install
```
Then, navigate to the root directory where app.py is located and install the backend dependencies:
```
$ pip install flask flask-cors pymongo
```
2. To utilize a local MongoDB database, ensure MongoDB is installed on your system.
In your application's database configuration, ensure that you are connecting to the local MongoDB instance, typically at mongodb://localhost:27017.
3. Start the application by running the frontend and backend servers. In the "lunch-recommendation" directory, start the frontend server:
```
$ npm run dev
```
In a separate terminal, navigate to the root directory where app.py is located and start the backend server:
```
$ python3 app.py
```

Main page
-
<img width="1428" alt="Screenshot 2024-01-02 at 2 52 13 PM" src="https://github.com/eazook10003/food-rec/assets/82238220/387fa3a2-d23e-4dfd-a102-947a91f477b5">

Log-in Page
-
<img width="1421" alt="Screenshot 2024-01-02 at 2 52 43 PM" src="https://github.com/eazook10003/food-rec/assets/82238220/1e33151f-4c43-418e-a81b-d2da7c875c31">

Sign-up Page
-
-<img width="1428" alt="Screenshot 2024-01-02 at 2 53 19 PM" src="https://github.com/eazook10003/food-rec/assets/82238220/85829126-3e6b-4a63-8b64-56a2c398bb20">

Survey page
-
<img width="1420" alt="Screenshot 2024-01-02 at 2 53 49 PM" src="https://github.com/eazook10003/food-rec/assets/82238220/f2ab4a8c-249b-4237-9a3b-87ed151f0752">

Cook Page
-
<img width="1426" alt="Screenshot 2024-01-02 at 2 56 06 PM" src="https://github.com/eazook10003/food-rec/assets/82238220/13f2e4c6-561e-4706-84ad-7f3de3a68869">
