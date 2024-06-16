import { useState, useEffect, FormEvent } from 'react';
import './App.css'

interface Country {
  name: string;
  code: string;
}

const RegisterForm= (props:StateMachinePage) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState<string>('');
  const [ready, setReady] = useState<Boolean>(false);

  useEffect(() => {
    setError('')
    setReady(password != '' && password === repeatPassword && username != '' && country!='' && error==='')
  }, [username,password,repeatPassword,country])

  useEffect(() => {
    // Fetch countries from your API or use a static list
    // For this example, we'll use a static list
    setCountries([
      { name: 'Mexico', code: 'MEX' },
      { name: 'Canada', code: 'CAN' },
      { name: 'United States', code: 'USA' },
      // Add more countries as needed
    ]);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username || !password || !repeatPassword || !country) {
      setError('All fields are required');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');

    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, country }),
    });

    if (response.ok) {
      const token = await response.json();
      localStorage.setItem('token',token)
      if(props.setPage){
        props.setPage('deposit')
      }
      else{
        window.location.replace('/')
      }
    } else {
      console.log('vliza tuka>')
      const message = await response.json();
      console.log(message)
      setError(message.message)
    }
  };

  
  return (
    <form className="flexColumn form" onSubmit={handleSubmit}>
      <input
        className={ready ? "inputSuccess" : "inputPrimary"}
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className={ready ? "inputSuccess" : "inputPrimary"}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className={ready ? "inputSuccess" : "inputPrimary"}
        type="password"
        placeholder="Repeat Password"
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
      <select
        className={ready ? "inputSuccess" : "inputPrimary"}
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">Select a country</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <button 
        className={ready ? "neon-button-success" : "neon-button"}
        type="submit">
        Register
      </button>

      <span className="clickable colorSecondary" onClick={
        () => {
          if(props.setPage){
            props.setPage('login')
          }
        }
      }>Or click here to login</span>
      {error && <span className="form-error">Error : {error}</span>}
    </form>
  );
};

export default RegisterForm;