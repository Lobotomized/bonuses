import { useState } from 'react';
import './App.css'
import { User } from './interfaces/User';

interface DepositPage extends StateMachinePage{
  setUser?:Function,
  setPage?:Function
}

function DepositComponent(props:DepositPage) {
  const [amount, setAmount] = useState<number>(0);
  const handleDeposit = async () => {
    try {
      const response = await fetch('http://localhost:3000/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+localStorage.getItem('token')
          
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok && props.setUser) {
        props.setUser((user:User) => {
          return {...user, balance:user.balance+=amount, successfulDeposits:user.successfulDeposits+1}
        })
        if(props.setPage){
          props.setPage('bonuses')
        }
      } else {
        console.error('Error depositing funds');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='flexColumn form'>
      <h1>Deposit</h1>
      <input
        type="number"
        className='inputPrimary'
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button className='neon-button' onClick={handleDeposit}>Deposit</button>
    </div>
  );
}

export default DepositComponent;