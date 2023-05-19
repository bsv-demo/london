import React, { useState, useEffect, lazy } from 'react'
import request from '../utils/request'
import { Typography, TextField, Button, IconButton, LinearProgress } from '@mui/material'
import { host } from '../constants'
import { makeStyles } from '@mui/styles'
import ConversationControls from '../components/ConversationControls'
import ArrowBack from '@mui/icons-material/ArrowBackIos'
import Send from '@mui/icons-material/Send'
import Markdown from 'markdown-to-jsx'
// Imported table styles for conversation markdown.
import './convoStyle.css'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  top_wrap: {
    top: '0px',
    left: '0px',
    position: 'fixed',
    width: '100vw',
    backgroundColor: '#ffffff',
    boxShadow: theme.shadows[3]
  },
  top_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '1em',
    padding: '0px 1.5em',
    boxSizing: 'border-box',
    margin: '0.75em auto',
    alignItems: 'center',
    maxWidth: theme.maxContentWidth,
    [theme.breakpoints.down('sm')]: {
      gridGap: '0.4em',
      margin: '0.4em auto',
      padding: '0px 0.5em'
    }
  },
  top_title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none'
  },
  bot_name: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.9em',
    userSelect: 'none'
  },
  messages_wrap: {
    paddingTop: '4em',
    paddingBottom: '6em'
  },
  send_form: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: '#ffffff',
    width: '100vw',
    padding: '0.75em',
    boxShadow: theme.shadows[3],
    boxSizing: 'border-box'
  },
  send_grid: {
    margin: 'auto',
    maxWidth: theme.maxContentWidth,
    display: 'grid',
    gridGap: '0.5em',
    gridTemplateColumns: '1fr auto'
  },
  message_field: {
    margin: 'auto',
    maxWidth: theme.maxContentWidth
  },
  send_button: {
    justifySelf: 'left'
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%'
  },
  th: {
    border: '1px solid black',
    padding: 8
  },
  td: {
    border: '1px solid black',
    padding: 8
  }
}), { name: 'Conversation' })

const Conversation = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [conversation, setConversation] = useState({})
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const classes = useStyles()

  const handleSend = async (e) => {
    e.preventDefault()
    setText('')
    setMessages(oldMessages => {
      return [
        ...oldMessages,
        { role: 'user', content: text.trim() }
      ]
    })
    // Scroll to bottom with a delay
    await new Promise(resolve => {
      setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
        resolve()
      }, 500) // Adjust the delay as needed
    })
    setTyping(true)
    const response = await request(
      'POST',
      `${host}/sendMessage`,
      {
        botID: match.params.botID,
        conversationID: match.params.conversationID,
        message: text.trim()
      }
    )
    if (response.status !== 'error') {
      setMessages(oldMessages => {
        return [
          ...oldMessages,
          { role: 'assistant', content: response.result }
        ]
      })
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    setTyping(false)
  }

  const handleKey = async e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.stopPropagation()
      await handleSend(e)
      e.target.focus()
    }
  }

  useEffect(() => {
    (async () => {
      const response = await request(
        'POST',
        `${host}/findBotById`,
        {
          id: match.params.botID
        }
      )
      const messagesResponse = await request(
        'POST',
        `${host}/listConversationMessages`,
        {
          botID: match.params.botID,
          conversationID: match.params.conversationID
        }
      )
      const conversationResponse = await request(
        'POST',
        `${host}/listConversationsWithBot`,
        {
          botID: match.params.botID
        }
      )
      if (conversationResponse.status !== 'error') {
        setConversation(conversationResponse.result.find(x => x.id == match.params.conversationID) || {})
      }
      if (response.status !== 'error') {
        setBot(response.result)
      }
      if (messagesResponse.status !== 'error') {
        setMessages(messagesResponse.result)
      }
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
      setLoading(false)
    })()
  }, [])

  return (
    <div className={classes.page_wrap}>
      <div className={classes.top_wrap}>
        <div className={classes.top_grid}>
          <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          <div>
            <Typography variant='h1' className={classes.top_title}>{conversation.title}</Typography>
            <Typography className={classes.bot_name} color='textSecondary'>{bot.name}</Typography>
          </div>
          {conversation && conversation.title && <ConversationControls
            conversation={conversation} update={async () => {
              const conversationResponse = await request(
                'POST',
            `${host}/listConversationsWithBot`,
            {
              botID: match.params.botID
            }
              )
              setConversation(conversationResponse.result.find(x => x.id == match.params.conversationID))
            }}
                                                 />}
        </div>
      </div>
      <div className={classes.messages_wrap}>
        {messages.map((x, i) => (
          <div key={i}>
            <p><b>{x.role === 'assistant' ? bot.name : 'You'}</b>:</p>
            <Markdown options={{ forceBlock: true }}>{x.content}</Markdown>
          </div>
        ))}
        {loading && <LinearProgress />}
        {typing && `${bot.name} is typing...`}
      </div>
      <form className={classes.send_form} onSubmit={handleSend}>
        <div className={classes.send_grid}>
          <TextField
            onChange={e => setText(e.target.value)}
            value={text}
            multiline
            className={classes.message_field}
            fullWidth
            disabled={loading}
            placeholder='Write a message...'
            onKeyUp={handleKey}
          />
          <IconButton className={classes.send_button} color='primary' disabled={loading} type='submit'><Send /></IconButton>
        </div>
      </form>
    </div>
  )
}

export default Conversation
