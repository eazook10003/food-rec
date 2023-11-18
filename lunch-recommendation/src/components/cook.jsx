import React, { useEffect, useState } from "react"

import {useLocation, useNavigate} from 'react-router-dom';

function Cook (){
    const location=useLocation()

    const [dishName, setDishName] = useState('');
    const [foodInfo, setFoodInfo] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/Cook", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: dishName }),
            });
            const data = await response.json();
            console.log(data)
            setFoodInfo(data);
        } catch (error) {
            console.error('Error fetching food info:', error);
        }
    };

    return (
        <div className="cook">
            <h1>COOK</h1>
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
                    <h2>{foodInfo.name}</h2>
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