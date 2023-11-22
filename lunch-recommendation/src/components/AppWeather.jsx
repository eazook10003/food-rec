import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom"
const AppWeather = () => {
  const history = useNavigate();
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
        localStorage.setItem('weatherData', JSON.stringify(data.main.temp)); // 날씨데이터를 cook.jsx에서 쓸 예정
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
    <div>
      <div style={{ backgroundImage: `url(${backgroundImage})` }}>
        <h1>Weather in {city}</h1>
        <p>Temperature: {weatherData.main.temp} °C</p>
        <p>Weather: {weatherData.weather[0].description}</p>
        {/* 여기에 추가적인 날씨 정보를 표시할 수 있습니다 */}
      </div>
      <Link to="/login">Login</Link>
    </div>
    
  );
}

export default AppWeather;
