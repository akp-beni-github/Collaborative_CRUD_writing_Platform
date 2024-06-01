import { useState, useRef } from 'react'
import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"
import './App.css';

// Setup Monaco Editor
// Attach YJS Text to Monaco Editor

function App() {
  const editorRef = useRef(null);
  let type;

  // Editor value -> YJS Text value (A text value shared by multiple people)
  // One person deletes text -> Deletes from the overall shared text value
  // Handled by YJS

  // Initialize YJS, tell it to listen to our Monaco instance for changes.

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

  //MongoDB key-value DB 
  //one bus={file_name:, txt:}


  //CREATE
  function writeFilename(){
    //write file name before add
  }
  function handleCreate(){

  }

  //READ
  function handleFileSelect(){
    //axios filename as res
  }

  //UPDATE
  function handleUpdate(){
    //save to db (update current text to choosen file)
    const textContent = type.toString();
    console.log(textContent);

  }

  //DELETE
  function handleDelete(){
    // delete where file_name=?
    // axios file_name as req

  }

  /*
  function updateEditorEXAMPLE(){
    // New string content to add to the editor
    const newContent = "This is the new content.";
    // Update the Yjs shared text type with the new content
    type.insert(0, newContent);
    // Update the Monaco editor with the new content
    editorRef.current.setValue(type.toString());
  }
*/

  
  return (
      <>
        <h1>COLLAB WRITING PLATFORM</h1>
        <div><h15>Welcome back ...username...</h15></div>
       
        <button onClick={handleCreate}class="custom-button">ADD</button>

        
        <Editor
          height="70vh"
          width="100vw"
          theme="vs-light"
          onMount={handleEditorDidMount}
        /> 
        

        <button onClick={handleUpdate} class="custom-button">Save</button>
      </>
  );
    
    
    
  
}

export default App