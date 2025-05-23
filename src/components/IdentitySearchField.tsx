import React, { useState } from 'react'
import { Identity } from '../types/metanet-identity-types'
import { useStore } from '../utils/store'
import SearchIcon from '@mui/icons-material/Search'
import {
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Icon,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { Theme, useTheme } from '@mui/material/styles'
import useAsyncEffect from 'use-async-effect'
import { NoMncModal } from 'metanet-react-prompt'
import { isIdentityKey } from '../utils/identityUtils'
import { defaultIdentity } from '@bsv/sdk'
import { Img } from '@bsv/uhrp-react'

export interface IdentitySearchFieldProps {
  theme?: Theme
  font?: string
  onIdentitySelected?: (selectedIdentity: Identity) => void,
  appName?: string,
  width?: string
  deduplicate?: boolean
}

const IdentitySearchField: React.FC<IdentitySearchFieldProps> = ({
  theme: themeProp,
  font = '"Roboto Mono", monospace',
  onIdentitySelected = (selectedIdentity: Identity) => {
    // By default the onIdentitySelected handler will just log the selection.
    console.log('Selected Identity:', selectedIdentity)
  },
  appName = 'This app',
  width = '250px',
  deduplicate = true
}) => {
  // Fallback to the default theme from the context
  const theme = themeProp || useTheme()!
  const [inputValue, setInputValue] = useState('')
  const { identities, fetchIdentities } = useStore()
  const [selectedIdentity, setSelectedIdentity] = useState(defaultIdentity)
  const [isLoading, setIsLoading] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isMncMissing, setIsMncMissing] = useState(false)

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue)
    setIsSelecting(false)
    setSelectedIdentity({} as Identity)
  }

  const handleSelect = (_event: React.SyntheticEvent, newValue: Identity | string | null) => {
    if (newValue && typeof newValue !== 'string') {
      setIsSelecting(true)
      setSelectedIdentity(newValue)
      onIdentitySelected(newValue)
    }
  }

  // Configure the filtering options for the AutoComplete component
  const filterOptions = (options: Identity[], { inputValue }: { inputValue: string }) => {
    // Filters users by name or identityKey
    const filtered = options.filter(option =>
      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.identityKey.toLowerCase().includes(inputValue.toLowerCase())
    );

    if (filtered.length === 0 && isIdentityKey(inputValue) && !isLoading) {
      // Create a new identity with the input as the identity key if no match found
      const newIdentity: Identity = {
        ...defaultIdentity,
        name: 'Custom Identity Key',
        identityKey: inputValue
      }
      return [newIdentity]
    }

    return filtered
  }

  useAsyncEffect(async () => {
    // If inputValue changes and we are not selecting, fetch the identity information
    try {
      if (inputValue && !isSelecting) {
        await fetchIdentities(inputValue, setIsLoading)
        // setIsMncMissing(false)
      }
    } catch (error) {
      setIsLoading(false)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (error.code === 'ERR_NO_METANET_IDENTITY') {
        // setIsMncMissing(true)
        console.log(error)
      } else {
        // Handle other errors or rethrow them
        console.error(error)
      }
    }
  }, [inputValue, isSelecting])

  const getAdornmentForSearch = () => {
    if (!selectedIdentity.name || selectedIdentity.name === defaultIdentity.name) {
      return <SearchIcon sx={{ color: '#FC433F', marginRight: 1 }} />
    }

    return <>
      <Avatar sx={{ width: 24, height: 24, marginRight: 1 }}>
        <Img
          style={{ width: '100%', height: 'auto' }}
          src={selectedIdentity.avatarURL}
          loading={undefined}
        />
      </Avatar>
    </>
  }

  function dedupIdentities(all: Identity[]): Identity[] {
    const uniques = new Set<string>()
    return all.filter(result => {
      if (uniques.has(result.identityKey)) {
        return false
      }
      uniques.add(result.identityKey)
      return true
    })
  }

  const options = (deduplicate) ? dedupIdentities(identities) : identities

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: font,
        width: '100%',
        padding: '20px'
      }}
    >
      <NoMncModal appName={appName} open={isMncMissing} onClose={() => setIsMncMissing(false)} />
      <Box
        sx={{
          position: 'relative',
          width: 'fit-content',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        <Autocomplete
          freeSolo
          options={options}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleSelect}
          getOptionLabel={(option) => {
            // Display the name of the identity once selected
            return typeof option === 'string' ? option : option.name
          }}
          filterOptions={filterOptions}
          renderInput={params => {
            return (
              <Box>
                <TextField
                  {...params}
                  label="Search Identity"
                  variant="filled"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: getAdornmentForSearch(),
                    style: {
                      color:
                        theme.palette.mode === 'light'
                          ? theme.palette.common.black
                          : theme.palette.common.white
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      // borderRadius: '10px',
                    },
                    '& .MuiFilledInput-root': {
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? theme.palette.common.white
                          : theme.palette.grey[900]
                    },
                    '& label': {
                      // Normal state
                      color:
                        theme.palette.mode === 'light'
                          ? theme.palette.common.black
                          : theme.palette.common.white
                    },
                    '& label.Mui-focused': {
                      // Focused state
                      color:
                        theme.palette.mode === 'light'
                          ? theme.palette.common.black
                          : theme.palette.common.white
                    },
                    '& .MuiFilledInput-underline:after': {
                      borderBottomColor: '#FC433F' // your desired color here
                    }
                  }}
                />
                {isLoading && (
                  <LinearProgress
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#FC433F' // your desired solid color
                      }
                    }}
                  />
                )}
              </Box>
            )
          }}
          PaperComponent={({ children }) => (
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? theme.palette.common.white
                    : theme.palette.grey[900],
                color:
                  theme.palette.mode === 'light'
                    ? theme.palette.common.black
                    : theme.palette.common.white,
                '& ul': { padding: 0 }
              }}
            >
              {children}
            </Box>
          )}
          renderOption={(props, option: Identity) => {
            return (
              <ListItem {...props} key={`${option.identityKey}${option.name}${option.badgeLabel}`}>
                <ListItemIcon>
                  <Tooltip
                    title={
                      option.badgeLabel
                    }
                    placement="right"
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Icon
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '20%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Img
                            style={{
                              width: '95%',
                              height: '95%',
                              objectFit: 'cover',
                              borderRadius: '20%'
                            }}
                            src={option.badgeIconURL}
                            loading={undefined}
                          />
                        </Icon>
                      }
                    >
                      <Avatar>
                        <Img
                          style={{ width: '100%', height: 'auto' }}
                          src={option.avatarURL}
                          loading={undefined}
                        />
                      </Avatar>
                    </Badge>
                  </Tooltip>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography noWrap style={{ maxWidth: 'calc(100% - 5px)' }}>
                      {option.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" style={{ color: 'gray' }}>
                      {`${option.identityKey.slice(0, 10)}...`}
                    </Typography>
                  }
                />
              </ListItem>
            )
          }}
          style={{
            width,
            backgroundColor:
              theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey[900]
          }}
        />
      </Box>
    </Box>
  )
}

export default IdentitySearchField
