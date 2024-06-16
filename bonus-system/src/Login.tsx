import { useState, FormEvent, useEffect } from 'react';
import './App.css'

const LoginForm= (props:StateMachinePage) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
      setError('')
    },[username,password])
  
    const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();
  
      if (!username || !password) {
        setError('All fields are required');
        return;
      }
  
      setError('');
      
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      let theJson = await response.json();
      if (response.ok) {
        localStorage.setItem('token', theJson.token)
        if(props && props.setPage){
          props.setPage('bonuses')
        }
        else{
          window.location.replace('/')
        }
      } else {
        setError(theJson?.message)
      }
    };
  
    return (
      <form className="flexColumn form" onSubmit={handleSubmit}>
        <input
          className={password != '' && username != '' && error === '' ? "inputSuccess" : "inputPrimary"}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className={password != '' && username != '' && error === '' ? "inputSuccess" : "inputPrimary"}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          className={password != '' && username != '' && error === '' ? "neon-button-success" : "neon-button"}
        
        type="submit">
          Login
        </button>
        {error && <span className="form-error">{error}</span>}
      </form>
    );
  };
  
  export default LoginForm;