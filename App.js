// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React ,{useState, useEffect, useCallback}from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import { StyleSheet, Text, View,Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as firebase from 'firebase'
import 'firebase/firestore'




  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCLvo5HY0uOQm4AQBeZB5PiGscrIVweTg4",
    authDomain: "mallu-chat-5e9dd.firebaseapp.com",
    projectId: "mallu-chat-5e9dd",
    storageBucket: "mallu-chat-5e9dd.appspot.com",
    messagingSenderId: "154432138551",
    appId: "1:154432138551:web:0f98b07eafc218d8b6beb2"
  };
  // Initialize Firebase
  if(firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig);
  }

const db = firebase.firestore()
const chatsRef = db.collection('chats')



export default function App() {
  const [user , setUser] = useState(null)
  const [name , setName] = useState('')
  const [messages,setMessages] = useState([])
  useEffect(()=>{
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot.docChanges().filter(({type}) => type ==='added')
                                              .map(({doc}) => {
                                                const message = doc.data()
                                                return {...message,createdAt: message.createdAt.toDate()}
                                              }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
                                              appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
  },[])

  const appendMessages = useCallback((messages)=> {
      setMessages((previousMessages)=> GiftedChat.append(previousMessages,messages))
  },[messages])

  async function readUser(){
const user = await AsyncStorage.getItem('user')
if(user){
  setUser(JSON.parse(user))
}
  }
async function handlePress(){
  const _id = Math.random().toString(36).substring(7);
  const user = {_id, name}
  await AsyncStorage.setItem('user',JSON.stringify(user))
  setUser(user)
}

//add data to firebase filestore
async function handleSend(messages){
  const writes = messages.map(m => chatsRef.add(m))
  await Promise.all(writes)
}


  if(!user){
    return <View style={styles.container}>
      <TextInput style={styles.input} placeholder ="Enter your name" value={name} onChangeText={setName}/>
      <Button onPress={handlePress} title="enter the chat" />
    </View>
  }
  return (
   
    <GiftedChat messages={messages} user={user} onSend={handleSend}/>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  input:{
    height:50,
    width:'100%',
    borderWidth:1,
    padding:15,
    marginBottom:20,
    borderColor:'gray'
  }
});
