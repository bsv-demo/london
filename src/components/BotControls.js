import React, { useState } from 'react'
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, LinearProgress } from '@mui/material'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { host } from '../constants'
import { withRouter } from 'react-router-dom'
import MoreIcon from '@mui/icons-material/MoreVert'
import { toast } from 'react-toastify'
import TrainingEditor from './TrainingEditor'
import Delete from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

const BotControls = ({ bot, update = () => { }, history }) => {
  // for the list
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const menuOpen = Boolean(menuAnchorEl)

  // deleting
  const [deleteOpen, setDeleteOpen] = useState(false)

  // renaming
  const [renameOpen, setRenameOpen] = useState(false)
  const [newBotName, setNewBotName] = useState(bot.name)

  // remottoing
  const [remottoOpen, setRemottoOpen] = useState(false)
  const [newBotMotto, setNewBotMotto] = useState(bot.motto)

  // retraining
  const [retrainOpen, setRetrainOpen] = useState(false)
  const [trainingMessages, setTrainingMessages] = useState(bot.trainingMessages)

  // selling
  const [sellOpen, setSellOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState(35000)

  // unlisting
  const [unlistOpen, setUnlistOpen] = useState(false)

  // loading
  const [loading, setLoading] = useState(false)

  const handleSell = async e => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setLoading(true)
      const response = await request('post', `${host}/listBotOnMarketplace`, {
        botID: bot.id,
        amount: sellAmount
      })
      if (response.status !== 'error') {
        setSellOpen(false)
        // history.push('/marketplace')
        toast.success(`You listed ${bot.name} for sale!`)
        update()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlist = async e => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setLoading(true)
      const response = await request('post', `${host}/removeBotFromMarketplace`, {
        botID: bot.id
      })
      if (response.status !== 'error') {
        setUnlistOpen(false)
        // history.push('/my-bots')
        toast.success(`${bot.name} is no longer for sale!`)
        update()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async e => {
    try {
      e.stopPropagation()
      e.preventDefault()
      setLoading(true)
      const response = await request('post', `${host}/killBot`, {
        botID: bot.id
      })
      if (response.status !== 'error') {
        setDeleteOpen(false)
        history.push('/my-bots')
        toast.success(`${bot.name} is dead. Long live ${bot.name}!`)
        update()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRename = async e => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setLoading(true)
      const response = await request('post', `${host}/renameBot`, {
        botID: bot.id,
        newName: newBotName
      })
      if (response.status !== 'error') {
        setRenameOpen(false)
        toast.success(`${bot.name} is renamed to ${newBotName}!`)
        update()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRemotto = async e => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setLoading(true)
      const response = await request('post', `${host}/changeBotMotto`, {
        botID: bot.id,
        newMotto: newBotMotto
      })
      if (response.status !== 'error') {
        setRemottoOpen(false)
        toast.success(`${bot.name}'s new motto is "${newBotMotto}"!`)
        update()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async e => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setLoading(true)
      const response = await paidRequest('post', `${host}/retrainBot`, {
        botID: bot.id,
        newTrainingMessages: trainingMessages
      })
      if (response.status !== 'error') {
        setRetrainOpen(false)
        toast.success(`${bot.name} is now retrained!`)
        update()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <IconButton
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          setMenuAnchorEl(e.currentTarget)
        }}
        style={{ zIndex: 1000 }}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        open={menuOpen} onClose={e => {
          setMenuAnchorEl(null)
          e.stopPropagation()
        }} anchorEl={menuAnchorEl}
      >
        {bot.editable && (
          <>
            <MenuItem onClick={e => {
              e.stopPropagation()
              setMenuAnchorEl(null)
              setRenameOpen(true)
            }}
            >Rename
            </MenuItem>
            <MenuItem onClick={e => {
              e.stopPropagation()
              setMenuAnchorEl(null)
              setRemottoOpen(true)
            }}
            >Change Motto
            </MenuItem>
            <MenuItem onClick={e => {
              e.stopPropagation()
              setMenuAnchorEl(null)
              setRetrainOpen(true)
            }}
            >Retrain
            </MenuItem>
          </>
        )}
        {bot.isForSale
          ? <MenuItem onClick={e => {
            e.stopPropagation()
            setMenuAnchorEl(null)
            setUnlistOpen(true)
          }}
            >
            Remove from marketplace
          </MenuItem>
          : <MenuItem onClick={e => {
            e.stopPropagation()
            setMenuAnchorEl(null)
            setSellOpen(true)
          }}
            >
            Sell Bot
            </MenuItem>}
        <MenuItem onClick={e => {
          e.stopPropagation()
          setMenuAnchorEl(null)
          setDeleteOpen(true)
        }}
        >Kill Bot
        </MenuItem>
      </Menu>
      <Dialog
        open={deleteOpen} onClose={e => {
          e.stopPropagation()
          setDeleteOpen(false)
        }}
      >
        <form onSubmit={handleDelete}>
          <DialogTitle>Kill "{bot.name}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Killing {bot.name} will make it so that no one can ever interact with this bot again!</DialogContentText>
            <br />
            <br />
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={e => {
              e.stopPropagation()
              setDeleteOpen(false)
            }}
                         >Cancel
            </Button>}
            {!loading && <Button
              type='submit'
              onClick={e => e.stopPropagation()}
              variant='contained'
                         >
              Kill Bot
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={unlistOpen} onClose={e => {
          e.stopPropagation()
          setUnlistOpen(false)
        }}
      >
        <form onSubmit={handleUnlist}>
          <DialogTitle>Remove "{bot.name}" from the marketplace?</DialogTitle>
          <DialogContent>
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={e => {
              e.stopPropagation()
              setUnlistOpen(false)
            }}
                         >Cancel
            </Button>}
            {!loading && <Button
              type='submit'
              onClick={e => e.stopPropagation()}
              variant='contained'
                         >
              Remove
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={sellOpen} onClose={e => {
          e.stopPropagation()
          setSellOpen(false)
        }}
      >
        <form onSubmit={handleSell}>
          <DialogTitle>Sell "{bot.name}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the amount of satoshis to sell this bot for.</DialogContentText>
            <br />
            <br />
            <TextField
              value={sellAmount}
              onChange={e => {
                e.stopPropagation()
                setSellAmount(e.target.value)
              }}
              onClick={e => {
                e.stopPropagation()
              }}
              type='number'
              fullWidth
              label='Amount'
            />
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={e => {
              e.stopPropagation()
              setSellOpen(false)
            }}
                         >Cancel
            </Button>}
            {!loading && <Button
              type='submit'
              onClick={e => e.stopPropagation()}
              variant='contained'
                         >
              List Bot
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={renameOpen} onClose={e => {
          e.stopPropagation()
          setRenameOpen(false)
        }}
      >
        <form onSubmit={handleRename}>
          <DialogTitle>Rename "{bot.name}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the new name to rename the bot:</DialogContentText>
            <br />
            <br />
            <TextField
              value={newBotName}
              onChange={e => {
                e.stopPropagation()
                setNewBotName(e.target.value)
              }}
              onClick={e => {
                e.stopPropagation()
              }}
              fullWidth
              label='New Name'
            />
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={e => {
              e.stopPropagation()
              setRenameOpen(false)
            }}
                         >Cancel
            </Button>}
            {!loading && <Button
              type='submit'
              onClick={e => e.stopPropagation()}
              variant='contained'
                         >
              Rename
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={remottoOpen} onClose={e => {
          e.stopPropagation()
          setRemottoOpen(false)
        }}
      >
        <form onSubmit={handleRemotto}>
          <DialogTitle>Change Motto For "{bot.name}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the new motto for the bot:</DialogContentText>
            <br />
            <br />
            <TextField
              value={newBotMotto}
              onChange={e => {
                e.stopPropagation()
                setNewBotMotto(e.target.value)
              }}
              onClick={e => {
                e.stopPropagation()
              }}
              fullWidth
              label='New Motto'
            />
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={e => {
              e.stopPropagation()
              setRemottoOpen(false)
            }}
                         >Cancel
            </Button>}
            {!loading && <Button
              type='submit'
              onClick={e => e.stopPropagation()}
              variant='contained'
                         >
              Change Motto
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog fullWidth maxWidth='xl' open={retrainOpen}>
        <form onSubmit={handleRetrain}>
          <DialogTitle>Retrain "{bot.name}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Revise the training messages for the bot:</DialogContentText>
            <br />
            <br />
            <TrainingEditor trainingMessages={trainingMessages} setTrainingMessages={setTrainingMessages} loading={loading} />
            {loading && <LinearProgress />}
          </DialogContent>
          <DialogActions>
            {!loading && <Button onClick={e => {
              e.stopPropagation()
              setRetrainOpen(false)
            }}
                         >Cancel
            </Button>}
            {!loading && <Button
              type='submit'
              onClick={e => e.stopPropagation()}
              variant='contained'
                         >
              Retrain Bot
            </Button>}
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default withRouter(BotControls)
