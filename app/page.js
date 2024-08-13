'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { auth, signInWithPopup, GoogleAuthProvider, signOut } from '/firebase.js';
import axios from 'axios';
export default function Home() {
  const initialMessage = {
    role: 'assistant',
    content: "Hi! I'm the Gen-Z AI. How can I help you today?",
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [user, setUser] = useState(null);
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [displayedWelcome, setDisplayedWelcome] = useState('');
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      setUser(result.user);
      setShowChatbot(true);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setShowChatbot(false);
      setDarkMode(true);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
  
    setIsLoading(true);
    const originalMessage = message;
    setMessage('');
    
    // Add the user's original message to the messages state
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: originalMessage },
      { role: 'assistant', content: '' },
    ]);
  
    try {
      // Translate the user's message to the selected language
      const translatedMessage = await translateMessage(originalMessage, selectedLanguage);
  
      // Send the translated message to the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: translatedMessage }],
          language: selectedLanguage,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json();
      const assistantMessage =
        responseData.choices[0]?.message?.content ||
        'No response from assistant';
  
      // Translate the assistant's response back to the user's language
      const translatedAssistantMessage = await translateMessage(assistantMessage, 'en'); // Assuming 'en' is the user's language
  
      // Update messages state with the assistant's response
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: translatedAssistantMessage },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
  
    setIsLoading(false);
  };
  
  // Translation function
  const translateMessage = async (text, targetLanguage) => {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key= your Key `, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Translation API response was not ok');
      }
  
      const responseData = await response.json();
      return responseData.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text in case of error
    }
  };
  

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([initialMessage]);
    setRating(0);
  };

  const toggleDarkMode = () => {
    setDarkMode(true);
  };

  const toggleLightMode = () => {
    setDarkMode(false);
  };

  const handleStarHover = (index) => {
    setHoveredRating(index + 1);
  };

  const handleStarClick = (index) => {
    setRating(index + 1);
  };
  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const messagesEndRef = useRef(null);
  const highlightsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const highlightText =
      "Our advanced chatbot uses AI to provide accurate and real-time responses to customer inquiries, ensuring efficient support. Experience seamless communication with real-time messaging and instant feedback, enhancing user interaction. Secure and easy login with Google authentication, providing a smooth user experience. Enjoy customizable UI with support for both dark and light modes to suit user preferences. Quickly find and manage information with our advanced search capabilities, designed for efficient query handling. A beautifully designed, user-friendly interface that adapts to various needs and preferences. Built to handle increasing loads and provide a high-performance experience for all users.";

    const typeEffectHighlight = () => {
      if (highlightIndex < highlightText.length) {
        setDisplayedHighlight((prev) => prev + highlightText[highlightIndex]);
        setHighlightIndex((prev) => prev + 1);
      }
    };

    const timeoutHighlight = setTimeout(typeEffectHighlight, 50);
    return () => clearTimeout(timeoutHighlight);
  }, [highlightIndex]);

  useEffect(() => {
    const welcomeText = "Welcome to Gen-Z AI!";

    const typeEffectWelcome = () => {
      if (welcomeIndex < welcomeText.length) {
        setDisplayedWelcome((prev) => prev + welcomeText[welcomeIndex]);
        setWelcomeIndex((prev) => prev + 1);
      }
    };

    const timeoutWelcome = setTimeout(typeEffectWelcome, 100);
    return () => clearTimeout(timeoutWelcome);
  }, [welcomeIndex]);

  const handleGetStarted = async () => {
    if (!user) {
      await handleSignIn();
    }
    setShowChatbot(true);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundImage: darkMode
          ? 'linear-gradient(to right top, #212224, #162d35, #003936, #174223, #424605)'
          : 'linear-gradient(to right top, #ffffff, #f0f0f0, #d0d0d0, #a0a0a0, #707070)',
        color: darkMode ? 'white' : 'black',
        overflow: 'hidden', // Prevent scrolling on the entire page
      }}
    >
      <Box position="absolute" top={16} right={16}>
        {user ? (
          <Typography>
            Welcome, {user.displayName}
            <Button onClick={handleSignOut} color="inherit">
              Sign Out
            </Button>
          </Typography>
        ) : (
          <Button onClick={handleSignIn} color="inherit">
            Sign In with Google
          </Button>
        )}
      </Box>

      {!showChatbot ? (
        <Box
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        maxWidth="800px"
        zIndex="1"
        position="relative"
        sx={{ height: '100vh' }}
      >
        <img
          src="/gen-z.webp"
          alt="Gen-Z Logo"
          style={{
            width: '200px',
            height: 'auto',
            borderRadius: '50%',
            marginBottom: '30px',
            animation: 'fadeIn 1s ease-out',
          }}
        />
        <Typography
          variant="h2"
          mb={6}
          sx={{
            animation: 'fadeIn 2s ease-in-out',
            opacity: 0,
            animation: 'fadeIn 2s ease-in-out forwards',
          }}
        >
          {displayedWelcome}
        </Typography>
        <Typography
          variant="h5"
          mb={6}
          sx={{
            animation: 'fadeIn 2s ease-in-out 0.5s forwards',
            opacity: 0,
          }}
        >
          Your AI Assistant is here to help you.
        </Typography>
      
        {/* Project Highlights Section */}
        <Box
          mt={4} // Margin top to push it below the welcome message
          p={3}
          borderRadius={5}
          sx={{
            backgroundColor: darkMode
              ? 'linear-gradient(to right top, #212224, #162d35, #003936, #174223, #424605)'
              : '#ffffff',
            width: '120%', // Full width within the container
            maxWidth: '1000px', // Set a maximum width
            border: '3px double #ddd',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            position: 'relative', // Keep within flow of the container
            overflowY: 'auto', // Enable vertical scrolling
            maxHeight: '20vh', // Set a maximum height for scrolling
          }}
        >
          <Typography variant="h6" mb={2}>
            Project Highlights
          </Typography>
          <Typography variant="body1">
            {displayedHighlight}
          </Typography>
        </Box>
      </Box>
      
      

        
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          maxWidth="600px"
          height="80vh" // Fixed height for chat container
          padding="16px"
          sx={{
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            backgroundColor: 'transparent', // Match background color with chat page
            overflow: 'hidden',
            position: 'relative',
          }}
        >

<Box
    display="flex"
    justifyContent="flex-end"
    position="absolute"
    top={16} // Adjust top value for vertical spacing from the top
    right={16} // Adjust right value for horizontal spacing from the right
    zIndex={10} // Ensure it's on top of other elements
  >
    <TextField
      select
      value={selectedLanguage}
      onChange={handleLanguageChange}
      SelectProps={{
        native: true,
      }}
      variant="outlined"
      size="small"
      sx={{
        width: 'auto', // Adjust width to fit content
        minWidth: '100px', // Minimum width to ensure readability
        backgroundColor: darkMode ? '#333' : '#fff', // Background color based on mode
        borderRadius: '4px', // Rounded corners
        borderColor: darkMode ? '#555' : '#ccc', // Border color based on mode
        '& .MuiSelect-select': {
          padding: '8px 12px', // Padding for better appearance
          color: darkMode ? '#fff' : '#000', // Text color based on mode
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: darkMode ? '#555' : '#ccc', // Border color based on mode
          },
          '&:hover fieldset': {
            borderColor: darkMode ? '#888' : '#666', // Border color on hover
          },
        },
      }}
    >
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
      {/* Add more language options here */}
    </TextField>
  </Box>


          <Stack
            spacing={2}
            height="100%" // Make sure stack takes up the full height of the container
          >
            <Box
              display="flex"
              flexDirection="column"
              flexGrow={1}
              overflow="auto"
              maxHeight="calc(100% - 64px)" // Adjust height to fit within the chat box
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  maxWidth="75%"
                  flexDirection="row"
                  marginBottom={1}
                  bgcolor={
                    msg.role === 'user'
                      ? '#ff69b4' // User message background color: Pink
                      : 'transparent' // AI message background color: Transparent
                  }
                  color={msg.role === 'user' ? '#fff' : '#000'}
                  alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  {msg.role === 'assistant' && (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      marginRight={1}
                      bgcolor="transparent" // Ensure the icon has no background color
                    >
                      <img
                        src="/gen-z.webp"
                        alt="Gen-Z AI"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                        }}
                      />
                    </Box>
                  )}
                  <Box
                    p={2}
                    borderRadius={msg.role === 'user' ? '20px' : '10px'}
                    bgcolor={msg.role === 'user' ? '#ff69b4' : '#87ceeb'} // AI message background color: Sky Blue
                    color={msg.role === 'user' ? '#fff' : '#000'}
                    maxWidth="calc(100% - 40px)" // Adjust width to account for icon size and margin
                  >
                    <Typography variant="body1">{msg.content}</Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

          

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mt={2}
              sx={{ width: '100%' }}
            >
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                multiline
                rows={2}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      edge="end"
                      color="inherit"
                      onClick={sendMessage}
                      disabled={isLoading}
                    >
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleClearChat}
                sx={{ marginLeft: '8px' }}
              >
                <ClearIcon />
              </IconButton>
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setDarkMode(!darkMode)}
                sx={{ marginLeft: '8px' }}
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Stack>

            {/* Rating Section */}
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              mt={4}
              p={2}
              borderRadius="8px"
              bgcolor="transparent"
            >
              <Typography variant="h6" mr={2}>
                Rate the Chat Experience
              </Typography>
              <Box display="flex">
                {[...Array(5)].map((_, index) => (
                  <IconButton
                    key={index}
                    onMouseEnter={() => handleStarHover(index)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => handleStarClick(index)}
                    sx={{
                      color: index < (hoveredRating || rating) ? 'blue' : '#000',
                      fontSize: '24px', // Adjust size as needed
                    }}
                  >
                    {index < (hoveredRating || rating) ? '★' : '☆'}
                  </IconButton>
                ))}
              </Box>
              <Typography ml={2}>
                {rating ? `You rated ${rating} star${rating > 1 ? 's' : ''}` : ''}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
