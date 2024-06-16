import { useEffect, useState } from "react"
import { Bonus } from "./interfaces/Bonus"
import { User } from "./interfaces/User"

interface BonusShopInterface extends StateMachinePage{
  user?:User,
  setUser?:Function,
  setAttemptedBonus?:Function,
  attemptedBonus?: Bonus
}
function BonusShop(props:BonusShopInterface) {
  const [bonuses,setBonuses] = useState<Bonus[]>([])
  const [dialogShow, setDialogShow] = useState<boolean>(false)
  const [dialogText, setDialogText] = useState(<p></p>)
  //Get bonuses


  useEffect(() => {
      let localBonuses:Bonus[] = []
      if(!props.user){
        const fetchData = async () => {
          const data = await fetch('http://localhost:3000/all-bonuses')
          const theJson = await data.json();
          localBonuses = theJson.bonuses
          setBonuses(theJson.bonuses)

          localBonuses = theJson.bonuses

          setBonuses(theJson.bonuses)
  
          // if(props.attemptedBonus){
          //   const theBonus = localBonuses.find((bonus) => {
          //     return bonus.id === props.attemptedBonus?.id
          //   })
          //   // console.log(theBonus, localBonuses)
          //   if(!theBonus){
          //     setDialogShow(true);
      
          //     setDialogText(<p>You are not elligible for this bonus</p>);
          //   }
          //   else{
          //     bonusClick(theBonus)
          //   }
          // }
      }
      fetchData();
    }
    else{
      const fetchData = async () => {
        const data = await fetch('http://localhost:3000/available-bonuses'
          , {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization':'Bearer '+ localStorage.getItem('token')
            }
          }
        )
        const theJson = await data.json();

        localBonuses = theJson.bonuses

        setBonuses(theJson.bonuses)

        // if(props.attemptedBonus){
        //   const theBonus = localBonuses.find((bonus) => {
        //     return bonus.id === props.attemptedBonus?.id
        //   })
        //   // console.log(theBonus, localBonuses)
        //   if(!theBonus){
        //     setDialogShow(true);
    
        //     setDialogText(<p>You are not elligible for this bonus</p>);
        //   }
        //   else{
        //     bonusClick(theBonus)
        //   }
        // }
      }
      fetchData();

    }
  }, [props.user])

  const bonusClick = async function(bonus:Bonus){
      if(!props.user){
        if(props.setAttemptedBonus){
          props.setAttemptedBonus(bonus)
        }
        setDialogShow(true)
        setDialogText(
          <div>
            <button className="button buttonSecondary" onClick={ () => {
              if(props.setPage){
                props.setPage('register')
              }
            }}>
              You need to signup or signin to continue. Click here to do it.
            </button>
          </div>
        )
        return;
      }
      
      const tooLittleCheck = (props.user.balance >= bonus.minAmount || bonus.minAmount === undefined) && 
                            (props.user.successfulDeposits >= bonus.minDeposits || bonus.minDeposits === undefined) 

      const tooManyCheck =  (props.user.balance <= bonus.maxAmount || bonus.maxAmount === undefined) &&
                            (props.user.successfulDeposits <= bonus.maxDeposits || bonus.maxDeposits === undefined)


      if(!tooManyCheck || !tooLittleCheck){
        if(props.setAttemptedBonus){
          props.setAttemptedBonus(bonus)
        }
        setDialogShow(true)

        if(!tooLittleCheck){
          setDialogText(
            <div>
              <button className="button buttonSecondary" onClick={ () => {
                if(props.setPage){
                  props.setPage('deposit')
                }
              }}>
                You need to deposit more in order to get this bonus. Click here to do it.
              </button>
            </div>
          )
        }
        else{
          setDialogText(
            <div>
              <button className="button buttonSecondary" onClick={ () => {
                if(props.setPage){
                  props.setPage('deposit')
                }
              }}>
                You deposited too many times or too much money for this bonus
              </button>
            </div>
          )
        }

        //props.setPage('deposit');
        return;
      }

      const activateBonusData = await fetch('http://localhost:3000/activate-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+localStorage.getItem('token')
        },
        body: JSON.stringify({ bonusId:bonus.id }),
      });

      setDialogShow(true);
      setDialogText(<p>{bonus.id} Successfully acquired</p>)

      if(activateBonusData.ok && props.setUser){
        props.setUser({...props.user, activeBonuses:[...props.user.pastBonuses,bonus.id]})
      }
      
  }
  //Check login

  return (
    <>

    <dialog open={dialogShow}>
      <div className="flexRow closeDialog">
        <button className="button buttonPrimary" onClick={() => {setDialogShow(false)}}>X</button>
      </div>

       {dialogText}
    </dialog>
    {
      props.user != undefined ?
        <div className="flexRow flexJustifySpaceAround logOutRow">
        <span> {props.user && props.user.activeBonuses.length >0 ? 'Active bonuses :'+ props.user?.activeBonuses.map((bonus) => {
          return bonus
        }) : 'You have no currently active bonuses'} |  Current balace : {props.user.balance}  |  Current deposits : {props.user.successfulDeposits}</span>

        <button className="button buttonPrimary" onClick={() =>{
              localStorage.setItem('token', '');
              if(props.setUser){
                props.setUser(undefined)
              }
            }}>
        Log out
      </button>
      </div> : ''
    }


    <div className="flexColumn flexJustifyCenter flexAlignCenter ">
      {
        bonuses.length > 0 ?
        bonuses.map((bonus, ind) => {
          return <div key={bonus.id} className={props.user?.pastBonuses.find(() => {
            bonus.id
          }) ? 'borderSuccess' : '' +'borderPrimary flexColumn bonusContainer flexJustifyCenter flexAlignCenter'}>
            <h3>{props.user?.pastBonuses}</h3>
            <h3>{bonus.name}</h3>
            {
              bonus.minAmount != undefined ? 
                <span>Min amount deposited elligible : {bonus.minAmount}</span> : ''
            }
            {
              bonus.maxAmount != undefined ? 
              <span>Max amount deposited to be elligible : {bonus.maxAmount}</span> : ''
            }
            {
              bonus.minDeposits ? <span>Min amount deposits to be elligible : {bonus.minDeposits}</span> : ''
            }
            {
              bonus.maxDeposits ? 
              <span>Max deposits to be elligible : {bonus.maxDeposits}</span> :''
            }
            
            <span>
              In countries : 
            {
              bonus.includedCountries.map((country) => {
                return <span key={country + ind}> | {country}</span> 
              })
            }
            </span>

            <button className="button buttonPrimary" onClick={() => bonusClick(bonus)}>Get bonus</button>
          </div>
          
        }) : <h2 className="maxWidthHeader">There are no available bonuses to you either because they are not available in your country or 
          because you deposited too much or too many times</h2>
      }
    </div>
    

    </>
  )
}

export default BonusShop
