import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import './Login.css'


function Login() {

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
                    history("/home",{state:{id:email}})
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


    return (
        <div className="login">

            <h1>뭐 먹지</h1>

            <form action="POST">
                <input type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Email"  />
                <input type="password" onChange={(e) => { setPassword(e.target.value) }} placeholder="Password"  />
                <p><Link class="Forgotpassword" to="/findpw">Forgot Password?</Link></p>
                <input class = "submit-button" type="submit" onClick={submit} />
            </form>

            <br />
            <p class ="noaccount"> Don't have an account?  <Link to="/signup">Signup Page</Link></p>
            <br />
            <Link to="/home">homepage</Link>

        </div>
    )
}

export default Login