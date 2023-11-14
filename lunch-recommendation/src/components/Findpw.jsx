import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

function Findpw(){

    const [email,setEmail]=useState('')
    const [securityQuestion,setSecurityQuestion]=useState('')
    const [securityAnswer,setSecurityAnswer]=useState('')


    async function submit(e){
        e.preventDefault();

        try{
            await axios.post("http://127.0.0.1:8000/findpw",{
                email, securityQuestion, securityAnswer
            })
            .then(res=>{
                if(res.data=="confirmed"){
                    alert("Your password has been changed to 0000")
                }
                else if(res.data=="wrong"){
                    alert("Wrong question")
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
        <div className="find">

            <h1>Find password</h1>

            <form action="POST">
                <input type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Email"  />
                <select onChange={(e) => setSecurityQuestion(e.target.value)} defaultValue="">
                    <option value="" disabled>Select a Security Question</option>
                    <option value="highSchoolName">What is your high school name?</option>
                    <option value="firstPetName">What is your first pet's name?</option>
                    <option value="birthCity">In what city were you born?</option>
                </select>
                <input type="text" onChange={(e) => setSecurityAnswer(e.target.value)} placeholder="Your Answer" />
                <input type="submit" onClick={submit} />
            </form>

            <br />
            <p>OR</p>
            <br />


            <Link to="/signup">Signup Page</Link>
            <Link to="/findpw">Forgot Password?</Link>

        </div>
    )
}

export default Findpw