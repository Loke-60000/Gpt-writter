import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { jsPDF } from "jspdf";
import sentAudio from './assets/sent.flac';
import kurisu from './assets/bg_character_.png'

function App() {
  const [API_KEY, setAPI_KEY] = useState(localStorage.getItem('API_KEY') || '');
  const [messages, setMessages] = useState([]);
  const [editAISettings, setEditAISettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(50);
  const inputRef = useRef(null);
  const apiKeyInputRef = useRef(null);
  const [requestStatus, setRequestStatus] = useState('');
  const playNotificationSound = () => {
    const audio = new Audio(sentAudio);
    audio.play();
  };

  const handleSaveAPIKey = () => {
    const apiKey = apiKeyInputRef.current.value;
    setAPI_KEY(apiKey);
    localStorage.setItem('API_KEY', apiKey);
  };

  const handleSend = async () => {
    const message = inputRef.current.value;
    const sentTime = new Date().toLocaleString();
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user",
      sentTime: sentTime
    };
    setMessages([...messages, newMessage]);
    setRequestStatus('Request sent');
    playNotificationSound();
    const response = await getResponseFromAI(message);
    downloadResponseAsPDF(response);
    setRequestStatus('');
    inputRef.current.value = '';
  };
  

  const getResponseFromAI = async (message) => {
    const prompt = "tell a joke everytime";
    const apiMessages = [
      { role: "system", content: prompt },
      { role: "user", content: message }
    ];
  
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": apiMessages,
      "temperature": temperature,
      "max_tokens": maxTokens
    };
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    });
  
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("Error in AI response:", data);
      return "Error: Unable to process the message.";
    }
  };
  
  

  const downloadResponseAsPDF = (response) => {
    const doc = new jsPDF();
    doc.text(response, 10, 10);
    doc.save("response.pdf");
  };

  useEffect(() => {
    if (localStorage.getItem('API_KEY')) {
      setAPI_KEY(localStorage.getItem('API_KEY'));
    }
  }, []);

  return (
    <div className="App">
      <div className="wrapper">
        <h1>Amadeus</h1>
        <p>Warning!</p>
        <p>Changing "max tokens" is required if you need a longer text!</p>
        <div className="api-key-container">
          <input
            ref={apiKeyInputRef}
            type="password"
            value={API_KEY}
            onChange={(e) => setAPI_KEY(e.target.value)}
            placeholder="Enter API Key"
          />
          <br/>
          <button onClick={handleSaveAPIKey}>Save API Key</button>
        </div>
        <div className="messageInput">
          <input
            ref={inputRef}
            type="text"
            placeholder="Explain your project here"
          />
          <br/>
          <button onClick={handleSend}>Send</button>
          <div className="requestStatus">{requestStatus}</div>
        </div>
        <div className="settingsToggle">
          <label htmlFor="editAISettings">Edit AI Settings</label>
          <input
            type="checkbox"
            id="editAISettings"
            checked={editAISettings}
            onChange={(e) => setEditAISettings(e.target.checked)}
          />
        </div>
        {editAISettings && (
          <div className="aiSettings">
            <label htmlFor="temperature">Temperature:</label>
            <input
              type="number"
              id="temperature"
              value={temperature}
              min="0"
              max="1"
              step="0.1"
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
            <label htmlFor="maxTokens">Max Tokens:</label>
            <input
              type="number"
              id="maxTokens"
              value={maxTokens}
              min="1"
              step="1"
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            />
          </div>
        )}
      </div>
      <img src={kurisu} className='kurisu' alt="" />
    </div>
  );
}

export default App;