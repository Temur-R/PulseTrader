import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { WatchlistItem } from '../types';

export const addToWatchlist = async (userId: string, stock: WatchlistItem) => {
  try {
    const watchlistRef = doc(db, 'watchlists', `${userId}_${stock.symbol}`);
    await setDoc(watchlistRef, {
      ...stock,
      userId,
      addedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, symbol: string) => {
  try {
    const watchlistRef = doc(db, 'watchlists', `${userId}_${symbol}`);
    await deleteDoc(watchlistRef);
  } catch (error) {
    throw error;
  }
};

export const getWatchlist = async (userId: string): Promise<WatchlistItem[]> => {
  try {
    const watchlistRef = collection(db, 'watchlists');
    const q = query(watchlistRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        marketCap: data.marketCap,
        targetPrice: data.targetPrice,
        alertType: data.alertType
      } as WatchlistItem;
    });
  } catch (error) {
    throw error;
  }
}; 