import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

import './survey.css';

const mapAnswersToPreferences = (answers) => {
  const categories = [
    { temp: "Hot", time: "Morning" },
    { temp: "Cold", time: "Morning" },
    { temp: "Warm", time: "Morning" },
    { temp: "Hot", time: "Afternoon" },
    { temp: "Cold", time: "Afternoon" },
    { temp: "Warm", time: "Afternoon" },
    { temp: "Hot", time: "Evening" },
    { temp: "Cold", time: "Evening" },
    { temp: "Warm", time: "Evening" }
  ];

  return answers.map((pageAnswers, pageIndex) => {
    return pageAnswers.map(dishName => ({
      dishName,
      ...categories[pageIndex]
    }));
  }).flat();
};


const Survey = () => {
  const navigate = useNavigate();
  const questions = ["더운날 아침에 어떤 음식들이 더 끌리시나요?", "추운날 아침에 어떤 음식들이 더 끌리시나요?", "좋은날 아침에 어떤 음식들이 더 끌리시나요?", "더운날 점심에 어떤 음식들이 더 끌리시나요?", "추운날 점심에 어떤 음식들이 더 끌리시나요?", "좋은날 점심에 어떤 음식들이 더 끌리시나요?", "더운날 저녁에 어떤 음식들이 더 끌리시나요?", "추운날 저녁에 어떤 음식들이 더 끌리시나요?", "좋은날 저녁에 어떤 음식들이 더 끌리시나요?"];
  const foodOptions = ["황태국", "김치찌개", "딸기잼 롤", "알리오올리오", "떡볶이", "오믈렛", "시저샐러드", "양송이스프"];
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState(Array(9).fill([]));
  const email = JSON.parse(localStorage.getItem('email'));

  const handleSelect = (food) => {
    let currentSelection = [...answers[currentPage]];
    if (currentSelection.includes(food)) {
      currentSelection = currentSelection.filter(item => item !== food);
    } else {
      currentSelection.push(food);
    }
    setAnswers(answers.map((item, idx) => idx === currentPage ? currentSelection : item));
  };

  const goToNext = () => {
    if (answers[currentPage].length < 5) {
      alert("최소 5개의 음식을 선택해야 합니다.");
      return;
    }
    setCurrentPage(currentPage + 1);
  };

  const goToPrevious = () => {
    setCurrentPage(currentPage - 1);
  };

  const saveResponses = async () => {
    const preferences = mapAnswersToPreferences(answers);
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/collectPreferences', {
        userId: email, // Replace with actual user's email
        responses: preferences
      });
  
      if (response.status === 200) {
        alert('설문이 성공적으로 저장되었습니다!');
        navigate('/home');
        // navigate('/home'); // Uncomment or update this as per your navigation logic
      } else {
        console.error('Server error:', response.status);
      }
    } catch (error) {
      console.error('Error while sending responses:', error);
    }
  };
  

  return (
    <div className="survey">
      <h1>{questions[currentPage]}</h1>
      <div className="food-grid">
        {foodOptions.map((food, index) => (
            <button
                key={index}
                className={answers[currentPage].includes(food) ? "selected" : ""}
                onClick={() => handleSelect(food)}
            >
                {food}
            </button>
        ))}
    </div>

    <div className="current-selection-count">
    현재 선택된 음식 수: {answers[currentPage].length}
    </div>

      <div className="navigation-buttons">
        {currentPage > 0 && <button onClick={goToPrevious}>이전</button>}
        {currentPage < questions.length - 1 ?
          <button onClick={goToNext}>다음</button> :
          <button onClick={saveResponses}>저장</button>}
      </div>
    </div>
  );
};

export default Survey;
