import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"

import {
    getFirestore,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzFBaUi11-Qw6kj5K61yGja5oyV6iKVpo",
    authDomain: "todoliste2.firebaseapp.com",
    projectId: "todoliste2",
    storageBucket: "todoliste2.appspot.com",
    messagingSenderId: "645581968514",
    appId: "1:645581968514:web:96a810be1e83a341b3509b",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const collectionName = "TodoItems"

// Eksempel med å hente opp ett doc:
// const docRef = doc(db, collectionName, "1")
// const docSnap = await getDoc(docRef)

// if (docSnap.exists()) {
//     console.log("Document data:", docSnap.data())
// } else {
//     // docSnap.data() will be undefined in this case
//     console.log("No such document!")
// }

// En referanse til div'en der jeg vil dytte inn oppgavene:
const listeRef = document.getElementById("liste")

// const q = query(collection(db, collectionName), where("erFerdig", "==", false))
const q = query(collection(db, collectionName), orderBy("created"))
const querySnapshot = await getDocs(q)
// const querySnapshot = await getDocs(collection(db, collectionName))
querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data())
    // Legger til alle oppgavene i lista vår:
    opprettListePunktLokalt(doc.data().tekst, doc.data().erFerdig, doc.id)
})

document.getElementById("knapp").addEventListener("click", leggTilNyOppgave)

async function leggTilNyOppgave() {
    console.log("leggTilNyOppgave")
    const oppgaveTekst = document.getElementById("oppgave").value
    console.log(oppgaveTekst)

    // Lagre oppgaven hos Google Firestore:
    const docRef = await addDoc(collection(db, collectionName), {
        tekst: oppgaveTekst,
        erFerdig: false,
        created: serverTimestamp(),
    })

    console.log("Document written with ID: ", docRef.id)
    opprettListePunktLokalt(oppgaveTekst, false, docRef.id)
    // Tøm inputen:
    document.getElementById("oppgave").value = ""
}

async function klikkPaaOppgave(event) {
    const elementKlikket = event.target
    const id = getIdFromElement(elementKlikket)
    const varFerdig = elementKlikket.classList.contains("ferdig")
    console.log("klikkPaaOppgave med ID " + id + " varFerdig: " + varFerdig)
    if (varFerdig) {
        elementKlikket.classList.remove("ferdig")
    } else {
        elementKlikket.classList.add("ferdig")
    }
    // Oppdater elementet i Databasen hos Firebase:
    const docRef = doc(db, collectionName, id)
    await updateDoc(docRef, {
        erFerdig: !varFerdig, // "!"" betyr "not" - altså "motsatt av hva den var"
    })
}

async function slettOppgave(event) {
    const elementKlikket = event.target
    const id = getIdFromElement(elementKlikket)
    console.log("SlettOppgave med ID: " + id)
    // Slett oppgaven "lokalt":
    listeRef.removeChild(elementKlikket.parentElement)
    // Slett oppgave fra Google Firestore:
    await deleteDoc(doc(db, collectionName, id))
}

// Henter IDen til objektet fra elementet som ble klikket (om det liger der), eller fra parent-elementet:
function getIdFromElement(element) {
    return element.dataset.id || element.parentElement.dataset.id
}

function opprettListePunktLokalt(tekst, erFerdig, id) {
    // Legg til oppgaven i "den lokale listen":
    const listePunkt = document.createElement("p")
    listePunkt.innerHTML = tekst
    listePunkt.classList.add(erFerdig ? "ferdig" : "todo")
    listePunkt.addEventListener("click", klikkPaaOppgave)

    // Lag x-en for å slette oppgave:
    const xMerke = document.createElement("i")
    // Legg på klassene: fa-regular fa-circle-xmark
    xMerke.classList.add("fa-regular", "fa-circle-xmark")
    xMerke.addEventListener("click", slettOppgave)

    const punktDiv = document.createElement("div")
    punktDiv.classList.add("punktDiv")
    punktDiv.dataset.id = id
    punktDiv.appendChild(xMerke)
    punktDiv.appendChild(listePunkt)
    listeRef.appendChild(punktDiv)
}
