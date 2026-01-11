import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import ChallengeService from '../services/ChallengeService';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [challenges, setChallenges] = useState(ChallengeService.getAllChallenges());

  const currentUser = ChallengeService.getCurrentUser();

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate async refresh with timeout for better UX
    setTimeout(() => {
      setChallenges(ChallengeService.getAllChallenges());
      setRefreshing(false);
    }, 300);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'accepted':
        return '#4CAF50';
      case 'locked':
        return '#2196F3';
      case 'completed':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return '#000';
    }
  };

  const renderChallenge = ({ item }) => (
    <TouchableOpacity
      style={styles.challengeCard}
      onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item.id })}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{item.description}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.challengeCondition}>{item.condition}</Text>
      
      <View style={styles.challengeFooter}>
        <Text style={styles.participants}>
          {item.creatorName} vs {item.opponentName}
        </Text>
        <Text style={styles.stake}>Stake: ${item.stake} | Pot: ${item.getTotalPot()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>iBetcha</Text>
        <Text style={styles.balance}>Balance: ${currentUser.balance}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        
        {challenges.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No challenges yet</Text>
            <Text style={styles.emptySubtext}>Create your first challenge!</Text>
          </View>
        ) : (
          <FlatList
            data={challenges}
            renderItem={renderChallenge}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateChallenge')}
      >
        <Text style={styles.createButtonText}>+ Create Challenge</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  balance: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  challengeCondition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  challengeFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  participants: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  stake: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
  },
  createButton: {
    backgroundColor: '#6200EE',
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
