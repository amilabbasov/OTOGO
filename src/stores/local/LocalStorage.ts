import AsyncStorage from '@react-native-async-storage/async-storage';

export class LocalStorage {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static async getLanguage(): Promise<string | null> {
    return await this.getItem('language');
  }

  static async setLanguage(language: string): Promise<void> {
    await this.setItem('language', language);
  }
}