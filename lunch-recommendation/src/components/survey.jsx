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
  const questions = ["땀을 흘리며 잠에서 깨어난 후, 가장 먹고 싶은 음식은 무엇인가요?", "차가운 아침 공기를 느끼며 일어난 후, 가장 먹고 싶은 음식은 무엇인가요?", "상쾌하고 맑은 아침공기가 느껴지는 아침, 가장 먹고 싶은 음식은 무엇인가요? ", "한 낮에 뜨거운 태양이 느껴지는 날, 가장 먹고 싶은 음식은 무엇인가요?", "입에서 김이 나는 추운 낮, 가장 먹고 싶은 음식은 무엇인가요?", "맑은 하늘에 바람이 선선히 부는 낮, 가장 먹고 싶은 음식은 무엇인가요?", "더위가 가시지 않는 밤, 가장 먹고 싶은 음식은 무엇인가요?", "긴 추운 하루를 마치고 가장 먹고 싶은 음식은 무엇인가요?", "달이 보이는 맑은 하늘에 기분이 좋아지는 바람이 부는 밤에 가장 먹고 싶은 음식은 무엇인가요?"];
  const foodOptions = ["황태국", "김치찌개", "딸기잼 롤", "알리오올리오", "떡볶이", "오믈렛", "시저샐러드", "양송이스프", "부대찌개", "떡볶이", "파전", "된장찌개", "김치볶음밥", "샌드위치", "김치전", "와플", "떡국", "김밥", "콩국수", "잔치국수", "비빔국수", "낙곱새", "곰국", "카레", "치킨"];
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
        navigate('/login');
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
