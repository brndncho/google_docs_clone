import React, { useRef, useEffect, useState } from 'react';
import { setDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth, signInWithGoogle, logOut } from '../firebase-config';
import "../App.css";
import { throttle } from 'lodash';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import {  onAuthStateChanged } from 'firebase/auth';

export const TextEditor = () => {
    const editorRef = useRef<any>(null);
    const quillInstance = useRef<any>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const isLocalChange = useRef<boolean>(false);
    const [user, setUser] = useState<any>(null);

    const documentRef = doc(db, "documents", "sample-doc");

    const saveContent = throttle(() => {
        if (quillInstance.current && isLocalChange.current) {
            const content = quillInstance.current.getContents();
            console.log('Saving content to db:', content);

            setDoc(documentRef, {content: content.ops}, {merge: true})
                .then(() => console.log("Content saved"))
                .catch(console.error);
            isLocalChange.current = false;
        }
    }, 1000);

    useEffect(() => {
        // remove double toolbar 
        const elements = document.getElementsByClassName("ql-toolbar");
        if (elements?.length > 0) {
        elements[0].remove();
        }

        // toolbar options
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }], 
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['bold', 'italic', 'underline', 'strike'],  
            [{ 'color': [] }, { 'background': [] }],    
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
          ];

        if (editorRef.current) {
            const quill = new Quill(editorRef.current, {
                modules: {
                  toolbar: toolbarOptions
                },
                theme: 'snow'
              });
            quillInstance.current = quill;
            
            // Load the initial content from database
            getDoc(documentRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const savedContent = docSnap.data().content;
                    if (savedContent) {
                        quillInstance.current.setContents(savedContent);
                    }
                } 
                else {
                    console.log("No doc found, starting with an empty editor");
                }
            }).catch(console.error);


            // Listen for changes from the database
            const unsubscribe = onSnapshot(documentRef, (snapshot) => {
                if (snapshot.exists()) {
                    const newContent = snapshot.data().content;

                    if (!isEditing) {
                        const editor = quillInstance.current;
                        const currentCursorPosition = editor.getSelection()?.index || 0;

                        editor.setContents(newContent, "silent");
                        editor.setSelection(currentCursorPosition);
                    }
                }
            });

            // Save local changes to the database
            const editor = quillInstance.current;
            editor.on('text-change', (delta: any, oldDelta: any, source: any) => {
                if (source == "user"){
                    isLocalChange.current = true;
                    setIsEditing(true);
                    saveContent();

                    setTimeout(() => 
                        setIsEditing(false), 5000);
                }
            });

            return () => {
                unsubscribe();
                editor.off("text-change");
            }
        };
    }, []);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <>
            <header className="header">
                <h1>Google Docs Clone</h1>
                <div className="header-right">
                    {user && (
                        <div className="user-info">
                            <span>{user.displayName}</span>
                            {user.photoURL && <img src={user.photoURL} alt="User Icon" className="user-icon" />}
                        </div>
                    )}
                    <button onClick={logOut} className="signout-btn">Sign Out</button>
                </div>
            </header>
            

            <div className="google-docs-editor">
                <div ref={editorRef}/>
            </div>
        </>
    );
};
