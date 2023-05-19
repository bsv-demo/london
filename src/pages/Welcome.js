import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { Typography, TextField, Button, CircularProgress, LinearProgress, Card, CardContent, CardTitle, CardActions, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { Link } from 'react-router-dom'
import { submitDirectTransaction } from '@babbage/sdk'
import { host } from '../constants'
import { makeStyles } from '@mui/styles'
import { toast } from 'react-toastify'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridGap: '8em',
    marginTop: '6em',
    placeItems: 'center',
    [theme.breakpoints.down('lg')]: {
      gridGap: '3em'
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
      marginTop: '1em'
    }
  },
  inline_icon: {
    width: '1.5em',
    height: '1.5em',
    borderRadius: '8px',
    display: 'none',
    marginRight: '0.25em',
    marginBottom: '-0.35em',
    [theme.breakpoints.down('md')]: {
      display: 'inline'
    }
  },
  app_icon: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    },
    userSelect: 'none',
    width: '100%',
    borderRadius: '16px',
    transition: 'all 0.4s',
    boxShadow: '10px 11px 16px 0px rgba(0,0,0,0.5)',
    '&:hover': {
      opacity: '0.85',
      transform: 'scale(1.1)',
      boxShadow: '10px 11px 42px 0px rgba(0,0,0,0.5)'
    }
  },
  list_item: {
    margin: '0.38em 0px',
    fontSize: '1.1em'
  },
  right_div: {
    minHeight: '100%',
    minWidth: '100%'
  },
  loading: {
    width: '20% !important',
    height: '20% !important',
    marginTop: '1em'
  },
  choice_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridGap: '1em'
  },
  royalties: {
    marginBottom: '1.5em'
  },
  card_actions: {
    flexDirection: 'row-reverse'
  }
}), { name: 'Welcome' })

const Welcome = () => {
  const [name, setName] = useState('')
  const [profile, setProfile] = useState('')
  const [needsCreate, setNeedsCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [royaltiesLoading, setRoyaltiesLoading] = useState(false)
  const [royaltyError, setRoyaltyError] = useState({})
  const [royaltyErrorConfirmOpen, setRoyaltyErrorConfirmOpen] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    (async () => {
      const profile = await request(
        'POST',
        `${host}/getOwnProfile`,
        {}
      )
      setLoading(false)
      if (profile.status === 'error') {
        setNeedsCreate(true)
      } else {
        setProfile(profile.result)
      }
    })()
  }, [])

  const handleCashOut = async () => {
    setRoyaltiesLoading(true)
    let paymentID
    try {
      const result = await request(
        'POST',
        `${host}/cashOut`,
        {}
      )
      if (result.status !== 'error') {
        const cash = result.result
        paymentID = cash.paymentID
        await submitDirectTransaction({
          protocol: '3241645161d8',
          transaction: {
            ...cash.transaction,
            outputs: [{
              vout: 0,
              satoshis: cash.amount,
              derivationSuffix: cash.derivationSuffix
            }]
          },
          senderIdentityKey: cash.senderIdentityKey,
          note: 'Payment for chatbot NFT sales',
          derivationPrefix: cash.derivationPrefix,
          amount: cash.amount
        })
        await request(
          'POST',
          `${host}/acknowledgePayment`,
          { paymentID: cash.paymentID }
        )
        setProfile(p => {
          return {
            ...p,
            balance: p.balance - cash.amount
          }
        })
        toast.success('Royalties collected!')
      }
    } catch (e) {
      toast.error(e.message)
      console.error(e)
      if (paymentID) {
        setRoyaltyError({
          error: e.message,
          paymentID
        })
      }
    } finally {
      setRoyaltiesLoading(false)
    }
  }

  const handleCreate = async e => {
    e.preventDefault()
    setLoading(true)
    const response = await request(
      'POST',
      `${host}/createUser`,
      {
        name
      }
    )
    if (response.status !== 'error') {
      setNeedsCreate(false)
      setProfile({
        name,
        balance: 0
      })
    }
    setLoading(false)
  }

  const handleClearRoyaltyError = async () => {
    try {
      setRoyaltiesLoading(true)
      await request(
        'POST',
        `${host}/acknowledgePayment`,
        { paymentID: royaltyError.paymentID }
      )
      const profile = await request(
        'POST',
        `${host}/getOwnProfile`,
        {}
      )
      setProfile(profile.result)
      setRoyaltyError({})
      setRoyaltyErrorConfirmOpen(false)
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setRoyaltiesLoading(false)
    }
  }

  return (
    <div className={classes.page_wrap}>
      <img src='/icon.png' alt='' className={classes.app_icon} />
      <div className={classes.right_div}>
        <Typography variant='h1'>
          <img className={classes.inline_icon} src='/icon.png' alt='' />
          BotCrafter!
        </Typography>
        <ul>
          <li className={classes.list_item}><Typography><b>Train</b> custom AI-powered chatbots</Typography></li>
          <li className={classes.list_item}><Typography><b>Trade</b> your creations as NFTs on the marketplace</Typography></li>
          <li className={classes.list_item}><Typography><b>Explore</b> bots with different personalities from all around the world</Typography></li>
        </ul>
        <br />
        <br />
        {needsCreate
          ? (
            <>
              <br />
              <br />
              <form onSubmit={handleCreate}>
                <TextField
                  disabled={loading}
                  fullWidth
                  autoFocus
                  onChange={e => setName(e.target.value)}
                  value={name}
                  placeholder='Type your name...'
                />
                <br />
                <br />
                <Button disabled={loading} variant='contained' color='primary' fullWidth size='large' type='submit'>Create Your Profile</Button>
              </form>
              <br />
              <br />
              {loading && <LinearProgress />}
            </>
            )
          : (
            <>
              {loading
                ? <center><CircularProgress className={classes.loading} /></center>
                : <>
                  <Typography variant='h2'>Salutations, {profile.name}!</Typography>
                  <Typography color='textSecondary' paragraph>Chat with your bots, or explore the marketplace.</Typography>
                  {profile.balance > 1000 && (
                    <Card elevation={4} className={classes.royalties}>
                      <CardContent>
                        <Typography variant='h5'>{royaltyError.error ? 'Royalty Error' : 'You\'ve got royalties!'}</Typography>
                        {!royaltyError.error && <Typography paragraph>People have bought or tried out your bots in the marketplace! You earned <b>{profile.balance} satoshis</b> in royalty payments.</Typography>}
                        {royaltyError.error && <Typography color='secondary' paragraph>{royaltyError.error}</Typography>}
                        {royaltiesLoading && <LinearProgress />}
                      </CardContent>
                      <CardActions className={classes.card_actions}>
                        {!royaltiesLoading && !royaltyError.error && <Button color='primary' onClick={handleCashOut}>Collect Now</Button>}
                        {!royaltiesLoading && royaltyError.error && <Button color='secondary' onClick={() => setRoyaltyErrorConfirmOpen(true)}>Clear Error</Button>}
                      </CardActions>
                    </Card>
                  )}
                  <div className={classes.choice_grid}>
                    <Link to='/my-bots'>
                      <Button variant='contained'>My Bots</Button>
                    </Link>
                    <Link to='/marketplace'>
                      <Button variant='outlined'>
                        Marketplace
                      </Button>
                    </Link>
                  </div>
                  </>}
            </>
            )}
      </div>
      <Dialog open={royaltyErrorConfirmOpen} onClose={() => setRoyaltyErrorConfirmOpen(false)}>
        <DialogTitle>Clear Royalty Error?</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>We think you may have already received and processed a royalty transaction on your end, but on our end it hasn't been marked as received by you yet.</DialogContentText>
          <DialogContentText paragraph>Once you confirm that you got the payment, you can clear this error and we'll mark it as received in our system. <b>If you're sure you didn't receive it, contact us instead of clearing the error.</b></DialogContentText>
          <DialogContentText paragraph><b>Error:</b>{royaltyError.error}</DialogContentText>
          {royaltiesLoading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          {!royaltiesLoading && <Button onClick={() => setRoyaltyErrorConfirmOpen(false)}>Cancel</Button>}
          {!royaltiesLoading && <Button onClick={handleClearRoyaltyError}>Clear the Error</Button>}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Welcome
