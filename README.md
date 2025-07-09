# Identity React Components

A library of reusable React components for displaying and searching identity information on the BSV Blockchain.

## Installation

```bash
npm install @bsv/identity-react
```
## Example Usage

#### Identity Card

```ts
import React from 'react'
import { IdentityCard } from '@bsv/identity-react'

const App = () => {
  return (
    <div>
      {/* Display an identity card using a known identity key */}
      <IdentityCard 
        identityKey="0240c42181068275a4f996ee570ed7c7a97c30003b174461bca5bad882fc06143f" 
        themeMode="light" // optional: 'light' or 'dark'
      />
    </div>
  )
}
```

> **Note:** The `IdentityCard` component caches resolved identities in sessionStorage for 5 minutes and up to 100 identities per session, greatly reducing redundant network requests.

#### Identity Search Field

```ts
import React, { useState } from 'react'
import { IdentitySearchField } from '@bsv/identity-react'
import { DisplayableIdentity } from '@bsv/sdk'

const IdentityDisplay: React.FC = () => {
  const [selectedIdentity, setSelectedIdentity] = useState<DisplayableIdentity | null>(null)

  return (
    <div>
      {/* Add a search field */}
      <IdentitySearchField 
        onIdentitySelected={(identity) => {
          setSelectedIdentity(identity)
        }}
        appName="My App" // optional: for MNC missing dialog
      />
      {selectedIdentity && (
        <div>
          <h2>Selected Identity</h2>
          <p>Name: {selectedIdentity.name}</p>
          <p>Identity Key: {selectedIdentity.identityKey}</p>
        </div>
      )}
    </div>
  )
}
```

> **Note:** The search field provides instant results for cached queries and is debounced (300ms) for new searches to optimize performance.

## Example Headless Usage (useIdentitySearch Hook)

```ts
import React from 'react'
import { useIdentitySearch } from '@bsv/identity-react'
import { DisplayableIdentity } from '@bsv/sdk'

const App = () => {
  const {
    identities,
    loading,
    inputValue,
    selectedIdentity,
    handleInputChange,
    handleSelect,
    clearCache
  } = useIdentitySearch({
    onIdentitySelected: (identity: DisplayableIdentity) => {
      console.log('Selected:', identity.name)
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <input
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search for identities..."
      />
      
      {loading ? (
        <p>Loading identities...</p>
      ) : (
        <>
          {inputValue !== '' && (
            <div>
              {identities.map((identity) => (
                <button 
                  key={identity.identityKey}
                  onClick={() => handleSelect(null, identity)}
                  style={{ margin: '4px', padding: '8px' }}
                >
                  {identity.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      
      {selectedIdentity && (
        <div>
          <h2>Selected Identity:</h2>
          <p><strong>Name:</strong> {selectedIdentity.name}</p>
          <img src={selectedIdentity.avatarURL} alt={selectedIdentity.name} width={64} />
          <p style={{ wordWrap: 'break-word' }}>
            <strong>Identity Key:</strong> {selectedIdentity.identityKey}
          </p>
        </div>
      )}
      
      <button onClick={clearCache} style={{ marginTop: '16px' }}>
        Clear Search Cache
      </button>
    </div>
  )
}

export default App
```

## Caching and Performance

- **Identity Search**: Uses in-memory cache with LRU eviction (max 100 entries) and 5-minute expiry
- **Identity Cards**: Uses sessionStorage-backed cache that persists across page reloads
- **Instant Results**: Cached queries and identities return immediately (0ms response time)
- **Debounced Search**: New searches are debounced by 300ms to prevent excessive API calls
- **Memory Management**: Automatic cache cleanup prevents unbounded memory growth

## License

The license for the code in this repository is the Open BSV License.
