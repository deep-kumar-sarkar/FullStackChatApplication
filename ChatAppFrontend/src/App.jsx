import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

//================================================================//
// 1. NEW COMPONENT FOR FORMATTING MARKDOWN-STYLE TEXT            //
// This component takes the raw text string from the AI           //
// and uses ReactMarkdown to render it as styled HTML.            //
//================================================================//
const FormattedMessage = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        // Customize how different elements are rendered by adding Tailwind CSS classes.
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-3 text-cyan-200" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3 text-cyan-300" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold my-2 text-cyan-300" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-3 pl-2 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-3 pl-2 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-cyan-400" {...props} />,
        code: ({node, ...props}) => <code className="bg-gray-800 rounded-md px-2 py-1 text-sm font-mono text-pink-400" {...props} />,
        hr: ({node, ...props}) => <hr className="border-gray-600 my-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};


// Main App Component
const App = () => {
  // State management
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. Send me a prompt, and I'll provide a formatted response!", sender: "ai" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref for the message container to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to bottom whenever messages state updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handles sending a message to the backend
  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return; // Don't send empty messages

    // Add user message to the chat
    const userMessage = { text: trimmedInput, sender: "user" };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // API call to the Spring Boot backend
      const url = `http://localhost:8080/ai/chat?prompt=${trimmedInput}`;
      
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const aiResponseText = await response.text();

      // Add AI response to the chat
      const aiMessage = { text: aiResponseText, sender: "ai" };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (err) {
      console.error("API call failed:", err);
      let specificError = "An unexpected error occurred. Please check the console for details.";
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
          const frontendOrigin = window.location.origin;
          specificError = `Could not connect to the AI assistant. Please perform these checks:\n\n1. Is your Spring Boot server running and accessible at http://localhost:8080?\n\n2. Have you configured CORS on your server? The request is coming from "${frontendOrigin}", so your annotation should look like this:\n  @CrossOrigin(origins = "${frontendOrigin}")`;
      }
      const errorMessage = { text: specificError, sender: "ai", isError: true };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setError(specificError);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles the Enter key press to send a message
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // SVG Icon for the send button
  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  );
  
  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
  );


  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-cyan-400">AI Chat Assistant</h1>
      </header>
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-800 text-white p-3 text-center transition-all duration-300">
            <p className="font-bold">Connection Error</p>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Chat Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* AI Avatar */}
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">AI</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-3xl rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 rounded-br-none'
                  : msg.isError
                  ? 'bg-red-700 text-white rounded-bl-none'
                  : 'bg-gray-700 rounded-bl-none'
              }`}
            >
              {/*===================================================================*/}
              {/* 2. CONDITIONAL RENDERING LOGIC                                    */}
              {/* If the sender is the AI and it's not an error, we use our         */}
              {/* new FormattedMessage component. Otherwise, we render plain text.  */}
              {/*===================================================================*/}
              {msg.sender === 'ai' && !msg.isError ? (
                <FormattedMessage content={msg.text} />
              ) : (
                <p className="text-base whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div className="max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-lg bg-gray-700 rounded-bl-none">
                <TypingIndicator />
              </div>
            </div>
        )}

        {/* This empty div is the target for scrolling */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="w-full max-w-4xl mx-auto flex items-center gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows="1"
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-2xl p-3 resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-600 text-white p-3 rounded-full hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
