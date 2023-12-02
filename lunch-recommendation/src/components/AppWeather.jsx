import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom"
import './AppWeather.css'


const CustomButton = ({ path, buttonText }) => {
  const handleClick = () => {
    window.location.href = path;
  };


  return(
    <div className="frame">
      <button className="custom-btn btn-2" onClick={handleClick}>{buttonText}</button>
    </div>
  );
};
const AppWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const city = "Corvallis";
  const apiKey = "a5df1d7cb8897052a6d74d8747739a2b";
  const lang = "kr";
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${lang}&units=metric`;

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setWeatherData(data);
        setBackgroundImage(determineBackground(data.weather[0].main));
      })
      .catch(error => console.error("Error fetching data: ", error));
  }, [url]);

  const determineBackground = (weatherCondition) => {
    switch(weatherCondition) {
      case 'Clear':
        return 'url_of_clear_weather_image'; //이미지 주소 복붙
      case 'Rain':
        return 'url_of_rainy_weather_image';
      // 추가적인 날씨 조건에 대한 케이스를 여기에 추가
      default:
        return 'default_background_image_url';
    }
  }
  
  if (!weatherData) return <div>Loading...</div>;

  return (
    <div class="firstpage-all">
      <div class="firstpage" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <h1 class="firstpage-logo">뭐 먹지</h1>
        <p>Temperature: {weatherData.main.temp} °C</p>
        <p>Weather: {weatherData.weather[0].description}</p>
        {/* 여기에 추가적인 날씨 정보를 표시할 수 있습니다 */}
      </div>
      <img class="firstpage-image" src="src\assets\AAA.png" alt="AAA" width="" height="500" />
      <div class="firstpage-buttons">
        <div class="Loginbutton">
          <CustomButton path="/login" buttonText="Login" /> {/* /login 경로로 이동하는 버튼 */}
          </div>
        <div class="Signupbutton">
          <CustomButton path="/Signup" buttonText="Signup" /> {/* /Signup 경로로 이동하는 버튼 */}
          </div>
      </div>
    </div>
    
  );
}

export default AppWeather;