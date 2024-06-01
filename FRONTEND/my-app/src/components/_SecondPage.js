import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"

const SecondPage = () => { 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileOptions, setFileOptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [newFile, setNewFile] = useState("");
    const navigate = useNavigate(); 

    const editorRef = useRef(null);
    const providerRef = useRef(null);
    const typeRef = useRef(null);

    useEffect(() => {
        fetchFileOptions();
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const response = await axios.delete('http://localhost:4000/logout', {
                withCredentials: true
            });
    
            if (response.status === 204) { 
                console.log('Refresh token in database is removed');
                console.log('User logged out successfully');
                navigate('/');
            } else {
                console.log('Refresh token in the database isn\'t removed');
            }
        } catch (error) {
            console.error('Logout error:', error.message);
            setError('Error occurred during logout: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const initializeEditor = (roomName) => {
        const doc = new Y.Doc();
        const provider = new WebrtcProvider(roomName, doc);
        const type = doc.getText("monaco");

        typeRef.current = type;
        providerRef.current = provider;

        new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    };

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    const fetchFileOptions = async () => {
        try {
            const response = await axios.get('http://localhost:4001/files', {
                withCredentials: true
            });
            setFileOptions(response.data);
        } catch (error) {
            console.error('Error fetching files:', error.message);
            setError('Error fetching files: ' + error.message);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        editorRef.current.setValue("");
        try {
            const response = await axios.post('http://localhost:4001/create', 
                { name: newFile },
                { withCredentials: true }
            );
            if (response.status === 204) {
                console.log('Created new file in the database');
                fetchFileOptions();
            } else {
                console.log('Could not connect to API');
            }
        } catch (error) {
            console.error('Create error:', error.message);
            setError('Error occurred during create: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const fileName = e.target.value;
        setSelectedFile(fileName);
        try {
            const response = await axios.get(`http://localhost:4001/file/${fileName}`, {
                withCredentials: true
            });
            editorRef.current.setValue(response.data.content);
            initializeEditor(fileName); // Reinitialize the editor with the new room name
        } catch (error) {
            console.error('Error fetching file content:', error.message);
            setError('Error fetching file content: ' + error.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        let textContent = typeRef.current.toString();
        try {
            const response = await axios.post('http://localhost:4001/update', 
                { name: selectedFile, content: textContent },
                { withCredentials: true }
            );
            if (response.status === 204) {
                console.log('Updated file in the database');
            } else {
                console.log('Could not connect to API endpoint');
            }
        } catch (error) {
            console.error('Update error:', error.message);
            setError('Error occurred during update: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`http://localhost:4001/delete/${selectedFile}`, {
                withCredentials: true
            });
            if (response.status === 204) {
                console.log('Deleted file from the database');
                fetchFileOptions();
                editorRef.current.setValue("");
                setSelectedFile("");
            } else {
                console.log('Could not connect to API');
            }
        } catch (error) {
            console.error('Delete error:', error.message);
            setError('Error occurred during delete: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>COLLAB WRITING PLATFORM</h1>
            <button onClick={handleCreate} disabled={loading}>
                {loading ? 'Adding...' : 'ADD'}
            </button>
            <button onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
            </button>
            <input
                name="newFileName"
                value={newFile}
                onChange={(e) => setNewFile(e.target.value)}
                placeholder="Write new file name"
            />
            <select onChange={handleFileSelect} value={selectedFile}>
                <option value="">Select a file</option>
                {fileOptions.map((file) => (
                    <option key={file} value={file}>{file}</option>
                ))}
            </select>
            <Editor
                height="70vh"
                width="100vw"
                theme="vs-dark"
                onMount={handleEditorDidMount}
            /> 
            <button onClick={handleUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out...' : 'Logout'}
            </button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default SecondPage;
