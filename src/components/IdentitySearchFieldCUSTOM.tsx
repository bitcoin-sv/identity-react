import { NoMncModal } from "metanet-react-prompt"
import { useEffect, useState } from "react"
import { FaPhoneAlt, FaSearch } from "react-icons/fa"
import { FaDiscord, FaXmark } from "react-icons/fa6"
import { Identity } from "../types"
import { fetchIdentities, sleep } from "../utils/identityUtils"
import { truncateText } from "../utils/textUtils"

export interface IdentitySearchFieldProps {
  font?: string
  confederacyHost?: string
  onIdentitySelected?: (selectedIdentity: Identity) => void
  appName?: string
}

const IdentitySearchField = ({
  isDarkMode = false,
  confederacyHost = "https://confederacy.babbage.systems",
  onIdentitySelected = (selectedIdentity: Identity) => {},
  appName = "My App",
}) => {
  // State & constants ================================================== //

  const [identities, setIdentities] = useState<Identity[]>([]) as any // array of Identity objects
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(
    null
  ) // stores selected Identity
  const [identitiesDropDownVisible, setIdentitiesDropdownVisible] = useState(
    false
  )
  const [inputValue, setInputValue] = useState<string | number>("") // text input
  const [isInputFocused, setIsInputFocused] = useState(false) // tracks whether the input is focused
  const [isContainerHovered, setIsContainerHovered] = useState(false) // tracks whether the container component is hovered
  const [clearButtonHovered, setClearButtonHovered] = useState(false) // tracks whether the text clear button is hovered
  const [hoveredIdentityIndex, setHoveredIdentityIndex] = useState<
    number | null
  >(null) // tracks which item in the list is hovered
  const [isMncMissing, setIsMncMissing] = useState(false) // Added state to control NoMncModal visibility
  const [hasIdentitySelected, setHasIdentitySelected] = useState(false)

  const accentColorRed = "rgb(232,83,73)"

  // Loading state and CSS animation =================================== //
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = `
      @keyframes scanningAnimation {
        0% {
          left: 0%;
          width: 0%;
          transform: translateX(0);
        }
        25% {
          left: 25%;
          width: 33%;
          transform: translateX(-33%);
        }
        50% {
          left: 50%;
          width: 50%;
          transform: translateX(-50%);
        }
        67% {
          left: 67%;
          width: 33%;
          
        }
        100% {
          left: 100%;
          width: 0%;
          
        }
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  // Fetching and debounce ============================================= //

  const fetchDebounceMs = 300

  useEffect(() => {
    if (inputValue === "") {
      setIdentities([])
      setIsLoading(false)
      return
    }

    if (!hasIdentitySelected) {
      const debouncedFetchIdentities = setTimeout(async () => {
        setIsLoading(true)
        try {
          const identityResults = await fetchIdentities(inputValue.toString())
          setIdentities(identityResults)
          setIdentitiesDropdownVisible(true)
          setIsLoading(false)
        } catch (e) {
          setIsLoading(false)
          console.error("Error fetching identities: ", e)
          //@ts-ignore
          if (e.code === "ERR_NO_METANET_IDENTITY") {
            setIsMncMissing(true)
          }
        }
      }, fetchDebounceMs)

      return () => clearTimeout(debouncedFetchIdentities)
    }
  }, [inputValue, hasIdentitySelected])

  // Render =========================================================== //

  return (
    <div>
      <NoMncModal
        appName={appName}
        open={isMncMissing}
        onClose={() => setIsMncMissing(false)}
      />
      <div
        style={{
          width: "300px",
          height: "56px",
          background: "white",
          position: "relative",
          filter: isInputFocused
            ? "brightness(100%)"
            : isContainerHovered
            ? "brightness(95%)"
            : "brightness(100%)",
        }}
        onMouseEnter={() => setIsContainerHovered(true)}
        onMouseLeave={() => setIsContainerHovered(false)}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            paddingTop: ".15rem",
            paddingLeft: ".7rem",
          }}
        >
          {/* label */}
          <label
            style={{
              padding: "0",
              margin: "0",
              color: "rgba(0,0,0,1)",
              fontSize: "12px",
              fontWeight: "400",
              fontFamily: "system-ui, Roboto, Helvetica, Arial, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Search Identity
          </label>
          {/* magnifying glass icon */}
          <div style={{ width: ".5rem !important" }}>
            {selectedIdentity ? (
              <div>{getIdentityImage(selectedIdentity, "1.4rem")}</div>
            ) : (
              <>
                {/* <svg style={{ fill: accentColorRed, height: "100%" }}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"></path>
              </svg> */}
                <FaSearch style={{ color: accentColorRed }} />
              </>
            )}
          </div>
        </div>

        {/* text input */}
        <input
          style={{
            border: "none",
            outline: "none",
            position: "absolute",
            left: "14%",
            top: "40%",
            width: "75%",
            height: "50%",
            fontSize: "16px",
          }}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setSelectedIdentity(null)
          }}
          onFocus={() => {
            setIsInputFocused(true)
          }}
          onBlur={() => {
            setIsInputFocused(false)
          }}
        />

        {/* clear input button */}
        {inputValue !== "" && (
          <>
            <div
              style={{
                position: "absolute",
                right: "5%",
                top: "35%",
                cursor: "pointer",
                opacity: "0.5",
              }}
              onClick={() => {
                setInputValue("")
                setSelectedIdentity(null)
              }}
              onMouseEnter={() => {
                setClearButtonHovered(true)
              }}
              onMouseLeave={() => {
                setClearButtonHovered(false)
              }}
            >
              <div>
                <FaXmark
                  style={{
                    color: "black",
                  }}
                />
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    borderRadius: "100%",
                    background: "gray",
                    opacity: "0.2",
                    position: "absolute",
                    color: "red",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    zIndex: "-1",
                  }}
                  hidden={!clearButtonHovered}
                />
              </div>
            </div>
          </>
        )}

        {/* Animated red line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: isLoading ? "0" : "50%", // Start from 0 when loading, otherwise centered
            transform: isLoading ? "none" : "translateX(-50%)",
            height: "2px",
            backgroundColor: accentColorRed,
            width: isInputFocused ? (isLoading ? "50%" : "100%") : "0", // Dynamic width based on state
            transition: isLoading ? "none" : "width 0.3s ease", // Disable transitions when loading
            animation: isLoading
              ? "scanningAnimation 1s infinite linear"
              : "none",
          }}
        />
      </div>

      {/* identites dropdown list */}
      {identities.length > 0 && inputValue !== "" && identitiesDropDownVisible && (
        <>
          {identities.map((identity, index) => {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  border: "1px solid #EEE",
                  padding: ".5rem",
                  background: "white",
                  filter:
                    hoveredIdentityIndex === index
                      ? "brightness(95%)"
                      : "brightness(100%)",
                  cursor: "pointer",
                  color: "black",
                  overflow: "hidden",
                }}
                onMouseEnter={() => {
                  setHoveredIdentityIndex(index)
                }}
                onMouseLeave={() => {
                  setHoveredIdentityIndex(null)
                }}
                onClick={() => {
                  setInputValue(
                    identity.decryptedFields.userName ||
                      identity.decryptedFields.phoneNumber
                  )
                  setIdentitiesDropdownVisible(false)
                  setSelectedIdentity(identity)
                  onIdentitySelected(identity)
                }}
              >
                {/* icon image based on SocialCert service */}
                {getIdentityImage(identity)}

                {/* username or phone number label */}
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                >
                  {identity.decryptedFields.userName ||
                    identity.decryptedFields.phoneNumber}

                  {/* username or phone number label */}
                  <label
                    style={{
                      fontSize: ".75rem",
                      opacity: "0.5",
                      cursor: "pointer",
                    }}
                  >
                    {truncateText(identity.subject, 10)}
                  </label>
                </label>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default IdentitySearchField

// takes an identity and returns either a profile image or a social icon
// Can be passed a scale coefficient that will change its size
const getIdentityImage = (identity: Identity, size?: string) => {
  const identityImageStyle = {
    width: size ? `${size}` : "2rem",
    height: size ? `${size}` : "2rem",
    borderRadius: "100%",
    marginRight: ".5rem",
    alignSelf: "center",
    color: "black",
  }

  // Ensure that decryptedFields is defined. If not, return an empty img tag
  const identityFields = identity.decryptedFields
  if (!identityFields) return <img src={""} style={identityImageStyle} /> // Or some fallback UI element

  // Check if profilePhoto exists and doesn't include 'null'
  if (
    identityFields.profilePhoto &&
    !identityFields.profilePhoto.includes("null")
  ) {
    return <img src={identityFields.profilePhoto} style={identityImageStyle} />
  } else if (identityFields.phoneNumber) {
    // If a phone number exists, return the phone icon
    return <FaPhoneAlt style={identityImageStyle} />
  } else if (
    identityFields.profilePhoto &&
    identityFields.profilePhoto.includes("discord")
  ) {
    // Check both if profilePhoto exists and includes 'discord'
    return <FaDiscord style={identityImageStyle} />
  }
  // Handle cases where none of the conditions are met
  return null // Or some other fallback UI element
}
