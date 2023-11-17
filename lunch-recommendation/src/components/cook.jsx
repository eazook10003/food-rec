import React from "react"
import {useLocation, useNavigate} from 'react-router-dom';

function Cook (){
    const location=useLocation()

    return (
        <div className="cook">
            <h1>COOK</h1>
        </div>
    )
}

export default Cook