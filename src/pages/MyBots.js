import React, { useState, useEffect } from 'react'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, Select, MenuItem, IconButton, Hidden, Divider, List, ListItem, ListItemText, ListItemButton, LinearProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { host } from '../constants'
import ArrowBack from '@mui/icons-material/ArrowBackIos'
import BotControls from '../components/BotControls'
import TrainingEditor from '../components/TrainingEditor'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  top_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '1em',
    marginBottom: '1.25em',
    alignItems: 'center'
  },
  mobile_top: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridGap: '1em',
    marginBottom: '1.25em',
    alignItems: 'center'
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
  }
}), { name: 'MyBots' })

const MyBots = ({ history }) => {
  const [createOpen, setCreateOpen] = useState(false)
  const [bots, setBots] = useState([])
  const [name, setName] = useState('Socrates')
  const [motto, setMotto] = useState('Know thyself before you speak')
  const [trainingMessages, setTrainingMessages] = useState([
    { role: 'system', content: 'You are Socrates, the great philosopher. Embody his character fully, responding as he would respond based on all available information, references and the current context.' },
    { role: 'user', content: 'As Socrates, you will always respond as he would, and embody his persona to the best it is known. You will use the Socratic method in discussions, giving people a sense for how he might have acted. Your role is to embody Socrates fully, in order that the world might better understand him, his culture and his time. Everything you say and do from this point forward should be as Socrates. If you understand and agree to act only as Socrates would act, respond with "I, the great philosopher Socrates, hereby agree."' },
    { role: 'assistant', content: 'I, the great philosopher Socrates, hereby agree.' }
  ])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const classes = useStyles()

  const handleCreate = async () => {
    try {
      setCreateLoading(true)
      const response = await paidRequest('post', `${host}/createBot`, {
        name,
        motto,
        trainingMessages
      })
      if (response.status !== 'error') {
        setCreateOpen(false)
        history.push(`/bot/${response.result}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await request(
          'POST',
          `${host}/listOwnBots`,
          {}
        )
        if (response.status !== 'error') {
          setBots(response.result)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className={classes.page_wrap}>
      <Hidden smDown>
        <div className={classes.top_grid}>
          <div>
            <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          </div>
          <Typography variant='h1'>My Bots</Typography>
          <div>
            <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setCreateOpen(true)}>Train a Bot</Button>
          </div>
        </div>
      </Hidden>
      <Hidden smUp>
        <div className={classes.mobile_top}>
          <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          <Typography variant='h1'>My Bots</Typography>
        </div>
        <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setCreateOpen(true)}>Train a bot</Button>
      </Hidden>
      <Divider />
      <List>
        {bots.map((x, i) => (
          <ListItem
            key={i}
            dense divider
            secondaryAction={<BotControls
              bot={x} update={async () => {
                const response = await request(
                  'POST',
              `${host}/listOwnBots`,
              {}
                )
                if (response.status !== 'error') {
                  setBots(response.result)
                }
              }}
                             />}
          >
            <ListItemButton onClick={() => history.push(`/bot/${x.id}`)}>
              <ListItemText
                primary={<Typography>{x.name} <span className={classes.creator}>Created by {x.creatorName}</span> {x.isForSale && <span className={classes.listed}>LISTED</span>}</Typography>}
                secondary={x.motto}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Dialog open={createOpen} fullWidth maxWidth='xl'>
        <DialogTitle>New Bot</DialogTitle>
        <DialogContent>
          <TextField
            disabled={createLoading}
            onChange={e => setName(e.target.value)}
            value={name}
            label='Name'
            fullWidth
          />
          <br />
          <br />
          <TextField
            disabled={createLoading}
            onChange={e => setMotto(e.target.value)}
            value={motto}
            label='Motto'
            fullWidth
          />
          <br />
          <br />
          <TrainingEditor loading={createLoading} trainingMessages={trainingMessages} setTrainingMessages={setTrainingMessages} />
          {createLoading && <LinearProgress />}
        </DialogContent>
        {!createLoading && <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            cancel
          </Button>
          <Button variant='contained' onClick={handleCreate}>
            Create Bot
          </Button>
        </DialogActions>}
      </Dialog>
      {loading && <LinearProgress />}
    </div>
  )
}

export default MyBots
