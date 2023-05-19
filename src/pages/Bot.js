import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText, List, ListItem, ListItemButton, ListItemText, IconButton, Divider, LinearProgress } from '@mui/material'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { host } from '../constants'
import { makeStyles } from '@mui/styles'
import ComposeIcon from '@mui/icons-material/Create'
import ArrowBack from '@mui/icons-material/ArrowBackIos'
import BotControls from '../components/BotControls'
import ConversationControls from '../components/ConversationControls'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  top_header: {
    display: 'grid',
    gridGap: '1em',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    marginBottom: '0.75em'
  },
  bot_avatar: {
    textAlign: 'center',
    margin: '3em',
    [theme.breakpoints.down('sm')]: {
      margin: '1em'
    }
  },
  page_title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none'
  },
  creator: {
    backgroundColor: '#99ffee',
    color: '#000 !important',
    fontWeight: 'bold !important',
    fontSize: '0.6em !important',
    borderRadius: '3px',
    padding: '0.2em'
  },
  listed: {
    backgroundColor: '#ffee99',
    color: '#000 !important',
    fontWeight: 'bold !important',
    fontSize: '0.6em !important',
    borderRadius: '3px',
    padding: '0.2em'
  },
  conversations_header: {
    display: 'grid',
    gridGap: '1em',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    marginBottom: '0.75em',
    marginTop: '1em',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  }
}), { name: 'Bot' })

const Bot = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [conversations, setConversations] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('New Conversation')
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  const handleCreate = async e => {
    try {
      e.preventDefault()
      setLoading(true)
      const response = await request(
        'POST',
        `${host}/createConversation`,
        {
          title,
          botID: match.params.botID
        }
      )
      if (response.status !== 'error') {
        setCreateOpen(false)
        history.push(`/conversation/${match.params.botID}/${response.result}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await request(
          'POST',
          `${host}/findBotById`,
          {
            id: match.params.botID
          }
        )
        const conversationsResponse = await request(
          'POST',
          `${host}/listConversationsWithBot`,
          {
            botID: match.params.botID
          }
        )
        setBot(response.result)
        setConversations(conversationsResponse.result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className={classes.page_wrap}>
      <div className={classes.top_header}>
        <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
        <Typography variant='h1' className={classes.page_title}>{bot.name}</Typography>
        {bot.name && <BotControls
          bot={bot} update={async () => {
            const response = await request(
              'POST',
          `${host}/findBotById`,
          {
            id: match.params.botID
          }
            )
            setBot(response.result)
          }}
                     />}
      </div>
      <Divider />
      <div className={classes.bot_avatar}>
        <Typography variant='h3'>{bot.name}</Typography>
        <Typography color='textSecondary'><i>{bot.motto}</i></Typography>
        {bot.creatorName && <span className={classes.creator}>Created by {bot.creatorName}</span>}
        {bot.isForSale && <span className={classes.listed}>LISTED</span>}
        {loading && <LinearProgress />}
      </div>
      <div className={classes.conversations_header}>
        <Typography variant='h4'>Conversations</Typography>
        <div>
          <Button
            variant='outlined'
            onClick={() => setCreateOpen(true)}
            startIcon={<ComposeIcon />}
            disabled={loading}
          >
            New Conversation
          </Button>
        </div>
      </div>
      <Divider />
      <List>
        {conversations.map((x, i) => (
          <ListItem
            key={i} divider secondaryAction={x.title && <ConversationControls
              conversation={x} update={async () => {
                const conversationsResponse = await request(
                  'POST',
            `${host}/listConversationsWithBot`,
            {
              botID: match.params.botID
            }
                )
                setConversations(conversationsResponse.result)
              }}
                                                        />}
          >
            <ListItemButton onClick={() => history.push(`/conversation/${match.params.botID}/${x.id}`)}>
              <ListItemText
                primary={x.title}
                secondary={x.lastMessage}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate}>
          <DialogTitle>Create Conversation</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter a title for the conversation. The name can be changed later.</DialogContentText>
            <br />
            <br />
            <TextField
              onChange={e => setTitle(e.target.value)}
              value={title}
              label='Title'
              fullWidth
            />
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={() => setCreateOpen(false)}>
              cancel
            </Button>}
            {!loading && <Button type='submit'>
              Create
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

export default Bot
