import React, { useEffect, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate, Link } from "react-router-dom"
import './Login.css'


function Login() {
    const location=useLocation()
    const history=useNavigate();

    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')

    async function submit(e){
        e.preventDefault();

        try{

            await axios.post("http://127.0.0.1:8000/",{
                email,password
            })
            .then(res=>{
                if(res.data=="exist"){
                    history("/home")
                     // 저장한 날씨데이터를 여기서 사용
                    localStorage.setItem('userID', JSON.stringify(email));
                    // sendTemperatureToServer(weatherData, email) // 사용자가 로그인을 성공하면 사용자 아이디와 로그인한 당시 날씨 데이터를 백엔드 서버로 보냄
                }
                else if(res.data=="wrong-pw"){
                    alert("Wrong password")
                }
                else if(res.data=="notexist"){
                    alert("User have not sign up")
                }
            })
            .catch(e=>{
                alert("wrong details")
                console.log(e);
            })
                
        }
        catch(e){
            console.log(e);

        }

    }
    // const sendTemperatureToServer = (temp, userId) => {
    //     fetch('http://127.0.0.1:8000/receive_temperature', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ temperature: temp, userId: userId }),
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         console.log('Temperature and User ID sent successfully');
    //     })
    //     .catch((error) => console.error('Error:', error));
    // };

    return (
        <div className="login" class="loginbody">

            <h1>뭐 먹지</h1>

            <form class="loginform" action="POST">
                <input type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Email"  />
                <input type="password" onChange={(e) => { setPassword(e.target.value) }} placeholder="Password"  />
                <p><Link class="Forgotpassword" to="/findpw">Forgot Password?</Link></p>
                <input class = "submit-button" type="submit" onClick={submit} />
            </form>

            <br />
            <p class ="noaccount"> Don't have an account?  <Link to="/signup">Signup Page</Link></p>
            <br />
            <Link to="/home">homepage</Link>
            
            <Link to="/">first page</Link>

        </div>
    )
}

export default Login