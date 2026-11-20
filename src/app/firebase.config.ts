import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

// Inicialización única de Firebase y de la instancia de Firestore.
export const firebaseApp = initializeApp(environment.firebase);
export const db = getFirestore(firebaseApp);
