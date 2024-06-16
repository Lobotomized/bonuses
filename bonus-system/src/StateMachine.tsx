import { useEffect, useState } from "react"
import LoginForm from "./Login"
import DepositComponent from "./Deposit"
import RegisterForm from "./Register"
import BonusShop from "./BonusShop"
import { User } from "./interfaces/User"
import { Bonus } from "./interfaces/Bonus"


function StateMachine() {
  const [user, setUser] = useState<User>();
  const [attemptedBonus, setAttemptedBonus] = useState<Bonus>();
  const [page, setPage] = useState(<BonusShop attemptedBonus={attemptedBonus} setAttemptedBonus={setAttemptedBonus} setUser={setUser} user={user} setPage={changePage}></BonusShop>);
  const [pageCode, setPageCode] = useState('bonuses');

  //Get use
  useEffect(() => {
    if(user){
      return
    }
    const fetchUser = async () => {
        const response = await fetch('http://localhost:3000/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+ localStorage.getItem('token')
          }
        });        
        const userProfile = await response.json();
        if(!response.ok){
          setUser(undefined)
        }
        else{
          setUser(userProfile)
        }
    }
    fetchUser();
  }, [page])

  useEffect(() => {
    changePage(pageCode); 
  }, [])
  useEffect(() => {
    changePage(pageCode)
  }, [user])


  function changePage(page:string){
    setPageCode(page)
    switch(page){
      case 'login':
        setPage(<LoginForm setPage={changePage}></LoginForm>);
      break;
      case 'deposit':
        setPage(<DepositComponent setUser={setUser} setPage={changePage}></DepositComponent>);
        break;
      case 'register':
        setPage(<RegisterForm setPage={changePage}></RegisterForm>);
      break;
      case 'bonuses':
         setPage(<BonusShop attemptedBonus={attemptedBonus} setAttemptedBonus={setAttemptedBonus} setUser={setUser} user={user} setPage={changePage}></BonusShop>);
        break;
    }
  }

  //Check login

  return (
    <>
      {page}
    </>
  )
}

export default StateMachine
