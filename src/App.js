import React from 'react'
import Welcome from './pages/Welcome'
import MyBots from './pages/MyBots'
import Marketplace from './pages/Marketplace'
import Bot from './pages/Bot'
import Conversation from './pages/Conversation'
import Theme from './Theme'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Typography } from '@mui/material'

const App = () => {
  return (
    <Theme>
      <Router>
        <Switch>
          <Route exact path='/' component={Welcome} />
          <Route exact path='/my-bots' component={MyBots} />
          <Route exact path='/marketplace' component={Marketplace} />
          <Route path='/conversation/:botID/:conversationID' component={Conversation} />
          <Route path='/bot/:botID' component={Bot} />
          <Route
            default component={() => (
              <center style={{ marginTop: '2em' }}>
                <Typography align='center' variant='h4' paragraph>
                  Page Not Found
                </Typography>
                <Typography>
                  <Link to='/'>Main menu</Link>
                </Typography>
              </center>
            )}
          />
        </Switch>
      </Router>
      <ToastContainer />
    </Theme>
  )
}

export default App
