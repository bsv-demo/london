import React, { useState } from 'react'
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, LinearProgress } from '@mui/material'
import request from '../utils/request'
import { host } from '../constants'
import { withRouter } from 'react-router-dom'
import MoreIcon from '@mui/icons-material/MoreVert'
import { toast } from 'react-toastify'

const ConversationControls = ({ conversation, update = () => { }, history }) => {
  // for the list
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const menuOpen = Boolean(menuAnchorEl)

  // deleting
  const [deleteOpen, setDeleteOpen] = useState(false)

  // renaming
  const [renameOpen, setRenameOpen] = useState(false)
  const [newConversationName, setNewConversationName] = useState(conversation.title)

  // loading
  const [loading, setLoading] = useState(false)

  const handleDelete = async e => {
    try {
      e.stopPropagation()
      e.preventDefault()
      setLoading(true)
      const response = await request('post', `${host}/deleteConversation`, {
        conversationID: conversation.id
      })
      if (response.status !== 'error') {
        setDeleteOpen(false)
        history.push(`/bot/${conversation.botID}`)
        toast.success(`${conversation.title} has been deleted.`)
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
      const response = await request('post', `${host}/renameConversation`, {
        conversationID: conversation.id,
        newName: newConversationName
      })
      if (response.status !== 'error') {
        setRenameOpen(false)
        toast.success(`${conversation.title} is renamed to ${newConversationName}!`)
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
          setDeleteOpen(true)
        }}
        >Delete Conversation
        </MenuItem>
      </Menu>
      <Dialog
        open={deleteOpen} onClose={e => {
          e.stopPropagation()
          setDeleteOpen(false)
        }}
      >
        <form onSubmit={handleDelete}>
          <DialogTitle>Delete "{conversation.title}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete {conversation.title}?</DialogContentText>
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
              Delete Conversation
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
          <DialogTitle>Rename "{conversation.title}"?</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the new name to rename the conversation:</DialogContentText>
            <br />
            <br />
            <TextField
              value={newConversationName}
              onChange={e => {
                e.stopPropagation()
                setNewConversationName(e.target.value)
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
    </>
  )
}

export default withRouter(ConversationControls)
