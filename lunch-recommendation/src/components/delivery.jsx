import React from "react"
import {useLocation, useNavigate} from 'react-router-dom';

function Delivery (){
    const location=useLocation()

    return (
        <div className="delivery">
            <h1>Delivery</h1>
        </div>
    )
}

export default Delivery