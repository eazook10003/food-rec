import React from "react"
import {useLocation, Link, useNavigate} from 'react-router-dom';

function Home (){
    const location=useLocation()

    return (
        <div className="homepage">

            {/* <h1>Hello {location.state.id} and welcome to the home</h1> */}
            <Link to="/cook">요리</Link>
            <p>/</p>
            <Link to="/delivery">외식 및 배달</Link>
            

        </div>
    )
}

export default Home