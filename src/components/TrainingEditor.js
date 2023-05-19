import React, { useState } from 'react'
import { Select, MenuItem, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Delete from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Help from '@mui/icons-material/Help'

const useStyles = makeStyles(theme => ({
  training_messages_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '0.5em',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  },
  new_help_grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridGap: '0.5em'
  }
}), { name: 'TrainingEditor' })

const TrainingEditor = ({ loading, trainingMessages, setTrainingMessages }) => {
  const [helpOpen, setHelpOpen] = useState(false)
  const classes = useStyles()
  return (
    <>
      <div className={classes.training_messages_grid}>
        {trainingMessages.map((x, i) => (
          <React.Fragment key={i}>
            <Select
              disabled={loading}
              value={x.role}
              onChange={e => {
                trainingMessages[i].role = e.target.value
                setTrainingMessages([...trainingMessages])
              }}
            >
              <MenuItem value='system'>System</MenuItem>
              <MenuItem value='user'>User</MenuItem>
              <MenuItem value='assistant'>Bot</MenuItem>
            </Select>
            <TextField
              multiline
              className={classes.training_msg_field}
              value={x.content}
              onChange={e => setTrainingMessages(old => {
                old[i].content = e.target.value
                return [...old]
              })}
              fullWidth
              disabled={loading}
              placeholder='Training Message...'
            />
            <IconButton
              disabled={loading}
              onClick={() => {
                setTrainingMessages(old => {
                  old.splice(i, 1)
                  return [...old]
                })
              }}
            ><Delete />
            </IconButton>
          </React.Fragment>
        ))}
      </div>
      <br />
      <div className={classes.new_help_grid}>
        <div>
          <Button
            onClick={() => {
              const newTrainingMessages = trainingMessages.concat({
                role: 'user',
                content: ''
              })
              setTrainingMessages(newTrainingMessages)
            }}
            startIcon={<AddIcon />}
            variant='outlined'
            disabled={loading}
          >
            New Training Message
          </Button>
        </div>
        <IconButton onClick={() => setHelpOpen(true)}><Help /></IconButton>
      </div>
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
        <DialogTitle>Training Information</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Training bots is more of an art than a science. Get your bots to embody their persona and act in character by giving them specific instructions. Using lots of repetition, saying things in multiple ways (or from diffeent perspectives), or even using ALL CAPS for emphasis have all been effective at training bots.
          </DialogContentText>
          <DialogContentText paragraph>Training Message Types</DialogContentText>
          <DialogContentText paragraph>
            <b>System messages</b> set the context for a conversation. They give the AI a sense for who it is and in what context it should respond. Usually, there is only one system message at the top, but you can experiment with different approaches. System messages might carry more weight than User or Bot messages, but you definitely need at least one of each type.
          </DialogContentText>
          <DialogContentText paragraph>
            <b>Example:</b> "You are Winston Churchill, inspirational leader of Great Britain. Draw from his quotes and respond as he would respond, citing historical evidence."
          </DialogContentText>
          <DialogContentText paragraph>
            <b>User messages</b> can contain instructions for the bot, or examples of thinga a user might ask the bot. They should always be followed by a Bot message, which is the bot's acknowledgment or desired response. To instill the instructions into a bot, a user message could ask the bot if it understands the instructions. Then, the next Bot message could simply say something like "I understand and will follow these instructions" to instill the instructions in your bot. Be creative!
          </DialogContentText>
          <DialogContentText paragraph>
            <b>Example:</b> "You will use lofty and colourful language, and act in your role as defender of Western civilization. If anyone brings up Neville Chamberlain, you will respond as Churchill would have. Do you understand these instructions, and will you always stay in character as Churchill?"
          </DialogContentText>
          <DialogContentText paragraph>
            <b>Bot messages</b> are acknowledgments of previously-given instructions from the preceding User message, or examples of ways that the bot should respond (in terms of its tone and character) when presented with similar questions by users. Bot messages are the weakest of the three types, but they are critical because they help accept and instill the desired training and personality attributes.
          </DialogContentText>
          <DialogContentText paragraph>
            <b>Example:</b> "Yes, I do accept, and undertake to carry forth in my solumn duty as Prime Minister. Long live the Western world and forever may the torch of Freedom be carried onwards, our backs will never be broken by this burden, great as it may be, and we shall NEVER be defeated!"
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TrainingEditor
