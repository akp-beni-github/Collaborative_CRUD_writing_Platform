import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"

import randomString from '@smakss/random-string';

const SecondPage = () => { 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 



    const editorRef = useRef(null);
    let type;
    let provider;
    let doc;
    let binding; 
    let content ="";
    

    async function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    
        // Initialize YJS
        doc = new Y.Doc(); // a collection of shared objects -> Text
    
        // Connect to peers (or start connection) with WebRTC
        provider = new WebrtcProvider("one-room", doc); // room1, room2
    
        // Get the YJS text type
        type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
    
        // Bind YJS to Monaco 
        binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    
        console.log(provider.awareness);  
    }
    


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

            } else {
                console.log('Refresh token in the database aint removed ');
            }
        } catch (error) {
            console.error('Logout error:', error.message);
            setError('Error occurred during logout: ' + error.message);
            
            
        } finally {
            setLoading(false);

            if (url) {
                window.URL.revokeObjectURL(url);
            }
            if (link && link.parentNode) {
                link.parentNode.removeChild(link);
            }

            doc.destroy()
            provider.disconnect();
            navigate('/');
        }
    };


    let link;
    let blob;
    let url;
    


   

    const handleExport = async () => {
        setLoading(true);
        setError(null);
    
        try {
            content = await type.toString();
            console.log(content);
            
            if (!content) { // Check if content is undefined, null, or empty
                content = " ";
            }
    
            const response = await axios.post('http://localhost:4001/export', { content }, {
                responseType: 'blob',
                withCredentials: true
            });
    
            blob = new Blob([response.data], { type: 'text/plain' });
            url = window.URL.createObjectURL(blob);
            link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'download.txt');
            document.body.appendChild(link);
            link.click();
    
        } catch (error) {
            console.error('Export error:', error.message);
            if (error.response) {
                if (error.response.status === 404) {
                    // Access token expired
                    try {
                        // Attempt to get a new token
                        const response2 = await axios.post('http://localhost:4000/token', null, {
                            withCredentials: true
                        });
                        console.log('came back from /token');
                        //return handleExport();

                    } catch (tokenError) {
                        // Handle token retrieval error
                        console.error('Token retrieval error:', tokenError.message); //401 from /token
                        console.log('no refresh to token! going log out!')
                            if (url) {
                                window.URL.revokeObjectURL(url);
                            }
                            if (link && link.parentNode) {
                                link.parentNode.removeChild(link);
                            }
                            type.delete(0, type.length);
                            doc.destroy()
                            provider.disconnect();
                            navigate('/');


                    }
                } else if (error.response.status === 401) {
                    // Unauthorized, handle accordingly
                } else {
                    setError('Error occurred during export: ' + error.message);
                }
            } else {
                setError('Error occurred during export: ' + error.message);
            }
        } finally {
            setLoading(false);
    
            if (url) {
                window.URL.revokeObjectURL(url);
            }
            if (link && link.parentNode) {
                link.parentNode.removeChild(link);
            }
            type.delete(0, type.length);
            doc.destroy()
            provider.disconnect();
            // Consider if reloading the page is necessary
            window.location.reload();
        }
    };
    
    

 



            
    return (
        <div>
            <h1>COLLABORATIVE WRITING PLATFORM</h1>

            <button onClick={handleExport} disabled={loading}>
                {loading ? 'Exporting...' : 'Export'}
            </button>

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