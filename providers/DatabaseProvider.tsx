import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { seedDatabase } from '@/lib/storage/seed';
import { LoadingState } from '@/components/common';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      // Give database a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Database initialized successfully');

      // Seed initial data
      await seedDatabase();

      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize database:', err);
      setError(err as Error);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <LoadingState message="Loading tasks..." />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default DatabaseProvider;
