import React, { useEffect, useState } from "react"

function Cook (){

    const [dishName, setDishName] = useState('');
    const [foodInfo, setFoodInfo] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const weatherData = JSON.parse(localStorage.getItem('weatherData')); // 날씨 정보를 가져옴
    const userID = JSON.parse(localStorage.getItem('userID'));           // 유저 아이디 정보를 가져옴

    // 백앤드에 날씨, 이메일 보낸 후 추천 메뉴 받아오기
    useEffect(() => {
        const fetchData = async () => {
            const userID = JSON.parse(localStorage.getItem('userID'));
            const weatherData = JSON.parse(localStorage.getItem('weatherData'));

            try {
                const response = await fetch("http://127.0.0.1:8000/predict", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userID, weather: weatherData })
                });
                const data = await response.json();
                if (data.error) {
                    console.error("Error in prediction:", data.error);
                } else {
                    setPrediction(data.prediction);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, []);

   
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 메뉴를 백앤드로 보내서 레시피 받아오기
            const recipeResponse = await fetch("http://127.0.0.1:8000/Cook", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: dishName }),
            });
            const recipeData = await recipeResponse.json();
            setFoodInfo(recipeData);
    
             // 검색버튼 눌렀을때 검색된 메뉴, 날씨, 유저 아이디를 백앤드로 보냄 - 해당 유저 데이터베이스에 정보들 저장하기 위해서
            const detailsResponse = await fetch("http://127.0.0.1:8000/submitDetails", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: dishName, weather: weatherData, userId: userID }), // 음식 날씨 아이디 정보를 백엔드로 보냄
            });
            const detailsData = await detailsResponse.json();
            console.log(detailsData);
    
        } catch (error) {
            console.error('Error fetching food info or submitting details:', error);
        }
    };
    

    return (
        <div className="cook">
            <h1>COOK</h1>

            {prediction && <div>추천 메뉴 4가지: {prediction}</div>}

            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="Enter Korean dish name"
                />
                <button type="submit">Get Recipe</button>
            </form>

            {foodInfo && (
                <div>
                    {/* <h2>{foodInfo.name}</h2> */}
                    <p>Ingredients: {foodInfo.ingredients}</p>
                    <ol>
                        {foodInfo.recipe.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}


export default Cook