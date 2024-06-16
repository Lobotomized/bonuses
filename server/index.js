const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors())
app.use(bodyParser.json());

const users = [];

const bonuses = [
    {
      id: "bonus1",
      name: "Welcome Bonus",
      description: "Get a welcome bonus when you join!",
      includedCountries: ["USA", "CAN"],
      excludedCountries: ["MEX"],
      maxDeposits: 1,
      minAmount: 20,
      maxAmount: 500,
    },
    {
      id: "bonus2",
      name: "Deposit Bonus",
      description: "Get a bonus on your second deposit!",
      includedCountries: ["USA", "CAN", "MEX"],
      excludedCountries: [],
      minDeposits: 1,
      maxDeposits: 1,
      minAmount: 20,
      maxAmount: 100,
    },
    {
      id: "bonus3",
      name: "Loyalty Bonus",
      description: "Get a loyalty bonus for being a valued customer!",
      includedCountries: ["USA", "CAN"],
      excludedCountries: [],
      minDeposits: 5,
      maxDeposits: 10,
      minAmount: 100,
      maxAmount: 500,
    },
  ];

// Middleware function to authenticate users using a JWT token
function authenticate(req, res, next) {
    if(!req.header('Authorization')){
      return res.status(401).json({message:'Access denied. No token provided.'});
    }
    const token = req.header('Authorization').split(' ')[1];
    if (!token) {
      return res.status(401).json({message:'Access denied. No token provided.'});
    }
  
    try {
      const decoded = jwt.verify(token, 'SECRET_KEY');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).send('Invalid token.');
    }
  }



app.post('/signup', async (req, res) => {
    try {
      const { username, password, country, successfulDeposits, pastBonuses, balance } = req.body;
      // Validate that required fields are present
      if (!username || !password || !country) {
        return res.status(400).json({message:'Username, password, and country are required fields'})
      }
      
      let exists = users.find((user) => {
        return user.username === username
      })

      if(exists){
        return res.status(400).json({message:'Username is taken'});

      }
      const hashedPassword = await bcrypt.hash(password, 8);
  
      const newUser = {
        id: uuidv4(),
        username,
        country,
        successfulDeposits: successfulDeposits || 0,
        pastBonuses: pastBonuses || [],
        balance: balance || 0,
        password: hashedPassword,
        activeBonuses: []
      };
      users.push(newUser);

      const token = jwt.sign({ username }, 'SECRET_KEY');
      res.status(201).json(token);
    } catch(err) {
      res.status(500).json({message: "Something went wrong"});
    }
  });

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(400).json({message: "User not found"});
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username }, 'SECRET_KEY');
      res.status(200).json({ token });
    } else {
      res.status(405).json({message:'Not allowed'});
    }
  } catch {
    res.status(500).json({message:"Something went wrong"});
  }
});

app.post('/deposit', authenticate, async (req, res) => {
    try {
      const { amount } = req.body;
      const user = users.find(u => u.username === req.user.username);
  
      if (!user) {
        return res.status(404).json({message:'User not found'});
      }
  
      if (!amount || amount <= 0) {
        return res.status(400).json({message:'Amount must be a positive number'});
      }
  
      user.balance += amount;
      user.successfulDeposits += 1;
      res.send({ balance: user.balance });
    } catch {
      res.status(500).send();
    }
  });



app.get('/user', authenticate, (req, res) => {
    const user = users.find(u => u.username === req.user.username);
    if (!user) {
      return res.status(404).json({message:'User not found'});
    }
    res.send(user);
  });


  app.get('/available-bonuses', authenticate, (req, res) => {
    const user = users.find(u => u.username === req.user.username);
  
    if (!user) {
      return res.status(404).json({message:'User not found'});
    }
  
    const availableBonuses = bonuses.filter(bonus => {
        const isIncluded = bonus.includedCountries.includes(user.country);
        const isExcluded = bonus.excludedCountries.includes(user.country);
       // const hasMinDeposits = !bonus.minDeposits || user.successfulDeposits >= bonus.minDeposits;
        //const hasMaxDeposits = !bonus.maxDeposits || user.successfulDeposits <= bonus.maxDeposits;
        //const hasMinAmount = !bonus.minAmount || user.balance >= bonus.minAmount;
        //const hasMaxAmount = !bonus.maxAmount || user.balance <= bonus.maxAmount;
        const notActiveOrPrevious = !user.activeBonuses.includes(bonus.id) && !user.pastBonuses.includes(bonus.id)
        return isIncluded && !isExcluded && notActiveOrPrevious //&& hasMinDeposits && hasMinAmount ; //&& hasMaxDeposits && hasMaxAmount //
      });
  
    res.json({bonuses:availableBonuses});
  });


  app.get('/all-bonuses', (req, res) => {
  
    res.json({bonuses:bonuses});
  });



  app.post('/activate-bonus', authenticate, (req, res) => {
    const user = users.find(u => u.username === req.user.username);
  
    if (!user) {
      return res.status(404).json({message:'User not found'});
    }
  
    const bonusId = req.body.bonusId;
  
    const bonus = bonuses.find(b => b.id === bonusId);
  
    if (!bonus) {
      return res.status(404).json({message:'Bonus not found'});
    }
  
    const isIncluded = bonus.includedCountries.includes(user.country);
    const isExcluded = bonus.excludedCountries.includes(user.country);
    const hasMinDeposits = bonus.minDeposits === undefined || user.successfulDeposits >= bonus.minDeposits;
    const hasMaxDeposits = bonus.maxDeposits  === undefined || user.successfulDeposits <= bonus.maxDeposits;
    const hasMinAmount = bonus.minAmount  === undefined || user.balance >= bonus.minAmount;
    const hasMaxAmount = bonus.maxAmount  === undefined || user.balance <= bonus.maxAmount;
    const isNotActivated = !user.activeBonuses.includes(bonus.id) && !user.pastBonuses.includes(bonus.id)
    console.log(hasMinDeposits, hasMaxDeposits, hasMinAmount, hasMaxAmount)
    if (!isIncluded || isExcluded || !hasMinDeposits || !hasMaxDeposits || !hasMinAmount || !hasMaxAmount || !isNotActivated) {
      return res.status(400).json({message:'Bonus is not available to the user or has already been activated'});
    }
    if(user.activeBonuses === undefined){
      user.activeBonuses = []
    }
    user.activeBonuses.push(bonus.id)
    res.send({ message: 'Bonus activated successfully' });
  });


app.listen(3000, () => console.log('Server started'));