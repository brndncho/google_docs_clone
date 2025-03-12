import ReactQuill from 'react-quill-new';
import React, { useRef, useEffect, useState } from 'react';
import { setDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import 'react-quill-new/dist/quill.snow.css';
import "../App.css";
import { throttle } from 'lodash';

export const TextEditor = () => {
    const quillRef = useRef<any>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const isLocalChange = useRef<boolean>(false);

    const documentRef = doc(db, "documents", "sample-doc");

    const saveContent = throttle(() => {
        if (quillRef.current && isLocalChange.current) {
            const content = quillRef.current.getEditor().getContents();
            console.log('Saving content to db:', content);

            setDoc(documentRef, {content: content.ops}, {merge: true})
                .then(() => console.log("Content saved"))
                .catch(console.error);
            isLocalChange.current = false;
        }
    }, 1000);

    useEffect(() => {
        if (quillRef.current) {
            // Load the initial content from database
            getDoc(documentRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const savedContent = docSnap.data().content;
                    if (savedContent) {
                        quillRef.current.getEditor().setContents(savedContent);
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
                        const editor = quillRef.current.getEditor();
                        const currentCursorPosition = editor.getSelection()?.index || 0;

                        editor.setContents(newContent, "silent");
                        editor.setSelection(currentCursorPosition);
                    }
                }
            });

            // Save local changes to the database
            const editor = quillRef.current.getEditor();
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

    return (
        <div className="google-docs-editor">
            <ReactQuill theme="snow" ref={quillRef}/>
        </div>
    );
};
