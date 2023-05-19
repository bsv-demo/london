import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Prompt from '@babbage/react-prompt'

ReactDOM.render(
  <Prompt
    supportedMetaNet='mainnet'
    appName='BotCrafter'
    author='Ty Everett'
    authorUrl='https://tyeverett.com'
    description='Train and trade AI chatbots with unique personalities as NFTs on Bitcoin SV'
    appIcon='/icon.png'
    appImages={[
      '/screenshots/1.png',
      '/screenshots/2.png',
      '/screenshots/3.png',
      '/screenshots/4.png',
      '/screenshots/5.png',
      '/screenshots/6.png'
    ]}
  >
    <App />
  </Prompt>,
  document.getElementById('root')
)
