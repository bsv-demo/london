import React, { useState, useEffect } from 'react'
import { TextField, Button, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions, Card, CardContent, Typography, IconButton, Divider, Hidden, LinearProgress, List, ListItem, ListItemText } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { toast } from 'react-toastify'
import { host } from '../constants'
import ArrowBack from '@mui/icons-material/ArrowBackIos'
import AddIcon from '@mui/icons-material/Add'
import Send from '@mui/icons-material/Send'

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
  marketplace_grid: {
    margin: '1.25em auto 2em auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridGap: '1em',
    width: '100%',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr'
    }
  },
  bot_name: {
    whiteSpace: 'nowrap',
    fontSize: '1.35em !important'
  },
  bot_motto: {
    fontSize: '0.9em !important',
    fontStyle: 'italic'
  },
  card_actions: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gridGap: '0.5em',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  },
  card: {
    borderRadius: '16px',
    transition: 'all 0.4s',
    '&:hover': {
      opacity: '0.85',
      transform: 'scale(1.05)',
      boxShadow: '5px 6px 21px 0px rgba(0,0,0,0.4)'
    }
  },
  messages_wrap: {
    paddingTop: '1em',
    paddingBottom: '1em'
  },
  send_form: {
    width: '100%',
    padding: '0.75em',
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
  trial_bottom: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gridGap: '1em',
    alignItems: 'center',
    padding: '0.5em',
    boxSizing: 'border-box'
  }
}), { name: 'Marketplace' })

const Marketplace = ({ history }) => {
  const [sellListOpen, setSellListOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState(35000)
  const [sellAmountOpen, setSellAmountOpen] = useState(false)
  const [botToSell, setBotToSell] = useState({})
  const [bots, setBots] = useState([])
  const [ownBots, setOwnBots] = useState([])
  const [botToBuy, setBotToBuy] = useState({})
  const [buyOpen, setBuyOpen] = useState(false)
  const [tryOpen, setTryOpen] = useState(false)
  const [trialMessages, setTrialMessages] = useState([])
  const [tryText, setTryText] = useState('')
  const [trialExitOpen, setTrialExitOpen] = useState(false)
  const [tryCost, setTryCost] = useState(0)
  const [wasTryOpen, setWasTryOpen] = useState(false)
  const [tryLoading, setTryLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)
  const [sellLoading, setSellLoading] = useState(false)
  const classes = useStyles()

  const handleSell = async e => {
    try {
      e.preventDefault()
      setSellLoading(true)
      const response = await request('post', `${host}/listBotOnMarketplace`, {
        botID: botToSell.id,
        amount: sellAmount
      })
      if (response.status !== 'error') {
        setOwnBots(old => {
          old.splice(ownBots.findIndex(x => x.id === botToSell.id), 1)
          return [...old]
        })
        const newBots = bots.concat({
          ...botToSell,
          amount: sellAmount,
          sellerName: 'You'
        })
        setBots(newBots)
        setSellAmountOpen(false)
        setBotToSell({})
        toast.success(`You listed ${botToSell.name} for sale!`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSellLoading(false)
    }
  }

  const handleBuy = async e => {
    e.preventDefault()
    try {
      setBuyLoading(true)
      let payload = {
        botID: botToBuy.id
      }
      if (trialMessages.length > 0) {
        payload.trialMessages = trialMessages
      }
      const response = await paidRequest('post', `${host}/buyBotFromMarketplace`, payload)
      if (response.status !== 'error') {
        setBuyOpen(false)
        setWasTryOpen(false)
        history.push(`/bot/${botToBuy.id}`)
        toast.success(`You bought ${botToBuy.name}!`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setBuyLoading(false)
    }
  }

  const handleTry = async e => {
    e.preventDefault()
    setTryText(tryText.trim())
    const newMessages = [
        ...trialMessages,
        { role: 'user', content: tryText.trim() }
      ]
    setTrialMessages(newMessages)
    setTryLoading(true)
    const response = await paidRequest(
      'POST',
      `${host}/tryMarketplaceBot`,
      {
        botID: botToBuy.id,
        messages: newMessages
      }
    )
    if (response.status !== 'error') {
      setTryCost(JSON.stringify([
        ...trialMessages,
          { role: 'user', content: tryText },
        { role: 'assistant', content: response.result }
      ]).length * 20)
      setTrialMessages(oldMessages => {
        return [
          ...oldMessages,
          { role: 'assistant', content: response.result }
        ]
      })
      setTryText('')
    }
    setTryLoading(false)
  }

  const handleKey = async e => {
    setTryCost(JSON.stringify([
      ...trialMessages,
      { role: 'user', content: e.target.value }
    ]).length * 20)
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.stopPropagation()
      await handleTry(e)
      e.target.focus()
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const marketplaceBots = await request(
          'POST',
          `${host}/listMarketplaceBots`,
          {}
        )
        const response = await request(
          'POST',
          `${host}/listOwnBots`,
          {}
        )
        if (marketplaceBots.status !== 'error') {
          setBots(marketplaceBots.result)
        }
        if (response.status !== 'error') {
          setOwnBots(response.result)
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
          <Typography variant='h1'>Marketplace</Typography>
          <div>
            <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setSellListOpen(true)}>Sell a bot</Button>
          </div>
        </div>
      </Hidden>
      <Hidden smUp>
        <div className={classes.mobile_top}>
          <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          <Typography variant='h1'>Marketplace</Typography>
        </div>
        <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setSellListOpen(true)}>Sell a bot</Button>
      </Hidden>
      <Divider />
      <div className={classes.marketplace_grid}>
        {bots.map((x, i) => (
          <Card key={i} className={classes.card}>
            <CardContent>
              <Typography className={classes.bot_name} variant='h2'>{x.name}</Typography>
              <Typography color='textSecondary' className={classes.bot_motto} paragraph>{x.motto}</Typography>
              <Typography paragraph>
                <i>Created by:</i> {x.creatorName}
              </Typography>
              <Typography paragraph>
                <i>Listed by:</i> {x.sellerName}
              </Typography>
              <div className={classes.card_actions}>
                <Typography><b>Price:</b> {Number(x.amount).toLocaleString()} sats</Typography>
                <Button
                  onClick={() => {
                    setTryOpen(true)
                    setBotToBuy(x)
                  }}
                >Try
                </Button>
                <Button
                  variant='outlined' onClick={() => {
                    setBuyOpen(true)
                    setBotToBuy(x)
                  }}
                >Buy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {loading && <LinearProgress />}
      <Dialog open={sellListOpen} fullWidth maxWidth='xl' onClose={() => setSellListOpen(false)}>
        <DialogTitle>Sell a Bot</DialogTitle>
        <DialogContent>
          {ownBots.length === 0 && (
            <DialogContentText>You have no bots to sell! But don't worry, <Link to='/my-bots' onClick={() => setSellListOpen(false)}>creating new bots is easy</Link>.</DialogContentText>
          )}
          <List>
            {ownBots.map((x, i) => (
              <ListItem dense divider key={i}>
                <ListItemText
                  primary={x.name}
                  secondary={x.motto}
                />
                <Button
                  onClick={() => {
                    setBotToSell(x)
                    setSellListOpen(false)
                    setSellAmountOpen(true)
                  }}
                  variant='outlined'
                  disabled={x.isForSale}
                >
                  {x.isForSale ? 'Listed' : 'Sell'}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
      <Dialog open={sellAmountOpen} onClose={() => setSellAmountOpen(false)}>
        <form onSubmit={handleSell}>
          <DialogTitle>Do you want to sell "{botToSell.name}"?</DialogTitle>
          <DialogContent>
            {!sellLoading && <DialogContentText paragraph>Enter the amount you'd like to list {botToSell.name} for on the marketplace.</DialogContentText>}
            {!sellLoading && <TextField
              fullWidth
              onChange={e => setSellAmount(e.target.value)}
              value={sellAmount}
              label='Amount'
                             />}
            {sellLoading && <LinearProgress />}
          </DialogContent>
          {!sellLoading && <DialogActions>
            <Button onClick={() => {
              setSellAmountOpen(false)
              setSellListOpen(true)
            }}
            >Back
            </Button>
            <Button variant='contained' type='submit'>List Now</Button>
          </DialogActions>}
        </form>
      </Dialog>
      <Dialog open={buyOpen} onClose={() => {
        setBuyOpen(false)
        if (wasTryOpen) {
          setTryOpen(true)
        }
      }}>
        <form onSubmit={handleBuy}>
          <DialogTitle>Want to buy "{botToBuy.name}" for {Number(botToBuy.amount).toLocaleString()} satoshis?</DialogTitle>
          {buyLoading && <DialogContent><LinearProgress /></DialogContent>}
          <DialogActions>
            {!buyLoading && <Button onClick={() => {
              setBuyOpen(false)
              if (wasTryOpen) {
                setTryOpen(true)
              }
            }}>Cancel</Button>}
            {!buyLoading && <Button variant='contained' type='submit'>Buy Now</Button>}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={tryOpen} fullWidth maxWidth='xl'>
        <DialogTitle>Try {botToBuy.name}</DialogTitle>
        <DialogContent>
        {trialMessages.map((x, i) => (
          <p key={i}><b>{x.role === 'assistant' ? botToBuy.name : 'You'}</b>: {x.content}</p>
        ))}
        {tryLoading && <p>...</p>}
        <form className={classes.send_form} onSubmit={handleTry}>
          <div className={classes.send_grid}>
            <TextField
              onChange={e => setTryText(e.target.value)}
              value={tryText}
              multiline
              className={classes.message_field}
              fullWidth
              disabled={tryLoading}
              placeholder='Write a message...'
              onKeyUp={handleKey}
            />
            <IconButton className={classes.send_button} color='primary' disabled={tryLoading} type='submit'><Send /></IconButton>
          </div>
          </form>
        </DialogContent>
        <div className={classes.trial_bottom}>
          <Typography><b>{tryCost}</b> satoshis for next message</Typography>
          <Button onClick={() => setTrialExitOpen(true)}>Exit Trial</Button>
          <Button variant='contained' onClick={() => {
            setTryOpen(false)
            setBuyOpen(true)
            setWasTryOpen(true)
          }}>Buy and keep conversation</Button>
          </div>
      </Dialog>
      <Dialog open={trialExitOpen}>
        <DialogTitle>Lose {botToBuy.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>Your conversation with {botToBuy.name} will be permanently lost! Buy {botToBuy.name} to keep the conversation going.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTrialExitOpen(false)
            setWasTryOpen(false)
            setTryOpen(false)
            setTrialMessages([])
          }}>Erase Conversation</Button>
          <Button variant='outlined' onClick={() => {
            setTryOpen(true)
            setTrialExitOpen(false)
            setWasTryOpen(false)
          }}>Go Back</Button>
        </DialogActions>
        </Dialog>
    </div>
  )
}

export default Marketplace
