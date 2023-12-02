import React from "react"
import {useLocation, Link, useNavigate} from 'react-router-dom';

function Home (){
    const location=useLocation()

    return (
        <div className="homepage">
          <Link to="/cook" className="button">
            요리
          </Link>
          <p>/</p>
          <Link to="/delivery" className="button">
            외식 및 배달
          </Link>
        </div>
      );
}

export default Home;