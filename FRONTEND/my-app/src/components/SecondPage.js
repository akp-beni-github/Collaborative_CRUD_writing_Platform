import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"

const SecondPage = () => { 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            
            const response = await axios.delete('http://localhost:4000/logout', {
                withCredentials: true
            });
    
            if (response.status === 204) { // Check for status code 204 No Content
                console.log('Refresh token in database is removed');
                console.log('User logged out successfully');

                navigate('/');
            } else {
                console.log('Refresh token in the database aint removed ');
            }
        } catch (error) {
            console.error('Logout error:', error.message);
            setError('Error occurred during logout: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const editorRef = useRef(null);
    let type;

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        // Initialize YJS
        const doc = new Y.Doc(); // a collection of shared objects -> Text
        // Connect to peers (or start connection) with WebRTC
        const provider = new WebrtcProvider("test-room", doc); // room1, room2
        type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
        // Bind YJS to Monaco 
        const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
        console.log(provider.awareness);  
    }  



            
    return (
        <div>
            <h1>COLLAB WRITING PLATFORM</h1>

        <Editor
          height="70vh"
          width="100vw"
          theme="vs-dark"
          onMount={handleEditorDidMount}
        /> 

        <button onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out...' : 'Logout'}
            </button>
            {error && <div style={{ color: 'red' }}>{error}</div>}

        </div>
    );
};

export default SecondPage;
