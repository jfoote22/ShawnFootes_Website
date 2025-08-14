// Quick debug script to check collaboration images
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  // Add your config here - check .env.local
};

async function checkCollaborationImages() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Checking all images in database...');
    const allImagesSnapshot = await getDocs(collection(db, 'images'));
    console.log(`Total images in database: ${allImagesSnapshot.size}`);
    
    allImagesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Image: ${doc.id}, Category: ${data.category}, Filename: ${data.filename}`);
    });
    
    console.log('\nChecking collaboration images specifically...');
    const collabQuery = query(collection(db, 'images'), where('category', '==', 'collaborations'));
    const collabSnapshot = await getDocs(collabQuery);
    console.log(`Collaboration images found: ${collabSnapshot.size}`);
    
    collabSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Collaboration: ${doc.id}, URL: ${data.url}, Name: ${data.customName || data.filename}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCollaborationImages();
