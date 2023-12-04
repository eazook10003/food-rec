import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import './Signup.css'


function Login() {
    const history=useNavigate(); //navigate between different pages

    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [age, setAge] = useState('')
    const [sex, setSex] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    async function submit(e){
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try{

            await axios.post("http://127.0.0.1:8000/signup",{
                email,password, age, sex, securityQuestion, securityAnswer
            })
            .then(res=>{
                if(res.data=="exist"){
                    alert("User already exists")
                }
                else if(res.data=="notexist"){
                    localStorage.setItem('email', JSON.stringify(email));
                    history("/survey")
                    //history("/home",{state:{id:email}})
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
        <div className="Signup">

            <h1>뭐 먹지</h1>

            <form class="Signup-form" action="POST">
                <input type="email" onChange={(e) => { setEmail(e.target.value) }} placeholder="Email" />
                <input type="password" onChange={(e) => { setPassword(e.target.value) }} placeholder="Password" />
                <input type="password" onChange={(e) => { setConfirmPassword(e.target.value) }} placeholder="Confirm Password" />
                <input type="age" onChange={(e) => { setAge(e.target.value) }} placeholder="Age" />
                <select class="custom-select" onChange={(e) => { setSex(e.target.value) }} defaultValue="">
                    <option value="" disabled>Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <select class="custom-select" onChange={(e) => setSecurityQuestion(e.target.value)} defaultValue="">
                    <option value="" disabled>Select a Security Question</option>
                    <option value="highSchoolName">What is your high school name?</option>
                    <option value="firstPetName">What is your first pet's name?</option>
                    <option value="birthCity">In what city were you born?</option>
                </select>
                <input type="text" onChange={(e) => setSecurityAnswer(e.target.value)} placeholder="Your Answer" />
                <input class="Signup-submit-button" type="submit" onClick={submit} />
            </form>

            <br />
            <p>Already have an acoount?   <Link to="/login">Login Page</Link></p> 
            <br />
        </div>
    )
}

export default Login