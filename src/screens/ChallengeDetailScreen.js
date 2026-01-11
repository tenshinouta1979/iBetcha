import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ChallengeService from '../services/ChallengeService';

const ChallengeDetailScreen = ({ route, navigation }) => {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState(null);
  const currentUser = ChallengeService.getCurrentUser();

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = () => {
    const ch = ChallengeService.getChallengeById(challengeId);
    setChallenge(ch);
  };

  const handleAcceptChallenge = () => {
    Alert.alert(
      'Accept Challenge',
      `You will stake $${challenge.stake}. Total pot: $${challenge.getTotalPot()}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => {
            try {
              ChallengeService.acceptChallenge(challengeId);
              loadChallenge();
              Alert.alert('Success', 'Challenge accepted! Ready to lock wagers.');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleLockWagers = () => {
    Alert.alert(
      'Lock Wagers',
      `This will deduct $${challenge.stake} from both parties. The wager will be locked.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Lock',
          onPress: () => {
            try {
              ChallengeService.lockChallenge(challengeId);
              loadChallenge();
              Alert.alert('Success', 'Wagers locked! Complete the challenge and verify the outcome.');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleVerifyOutcome = (winnerId, winnerName) => {
    Alert.alert(
      'Verify Outcome',
      `Declare ${winnerName} as the winner? They will receive the full pot of $${challenge.getTotalPot()}.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            try {
              ChallengeService.completeChallenge(challengeId, winnerId);
              loadChallenge();
              Alert.alert('Challenge Complete!', `${winnerName} wins $${challenge.getTotalPot()}!`);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleCancelChallenge = () => {
    Alert.alert(
      'Cancel Challenge',
      'Are you sure you want to cancel this challenge?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            try {
              ChallengeService.cancelChallenge(challengeId);
              Alert.alert('Cancelled', 'Challenge has been cancelled.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (!challenge) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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

  const isCreator = currentUser.id === challenge.creatorId;
  const isOpponent = currentUser.id === challenge.opponentId;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(challenge.status) }]}>
          <Text style={styles.statusText}>{challenge.status.toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{challenge.description}</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Condition:</Text>
            <Text style={styles.infoValue}>{challenge.condition}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creator:</Text>
            <Text style={styles.infoValue}>{challenge.creatorName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Opponent:</Text>
            <Text style={styles.infoValue}>{challenge.opponentName}</Text>
          </View>
        </View>

        <View style={styles.potCard}>
          <Text style={styles.potLabel}>Stake per person</Text>
          <Text style={styles.potAmount}>${challenge.stake}</Text>
          <Text style={styles.totalPotLabel}>Total Pot</Text>
          <Text style={styles.totalPotAmount}>${challenge.getTotalPot()}</Text>
        </View>

        {challenge.status === 'pending' && isOpponent && (
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptChallenge}>
            <Text style={styles.buttonText}>Accept Challenge</Text>
          </TouchableOpacity>
        )}

        {challenge.status === 'pending' && isCreator && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelChallenge}>
            <Text style={styles.cancelButtonText}>Cancel Challenge</Text>
          </TouchableOpacity>
        )}

        {challenge.status === 'accepted' && (
          <TouchableOpacity style={styles.lockButton} onPress={handleLockWagers}>
            <Text style={styles.buttonText}>Lock Wagers</Text>
          </TouchableOpacity>
        )}

        {challenge.status === 'locked' && (
          <View style={styles.verifySection}>
            <Text style={styles.sectionTitle}>Verify Outcome</Text>
            <Text style={styles.verifySubtext}>Who won the challenge?</Text>
            
            <TouchableOpacity
              style={styles.winnerButton}
              onPress={() => handleVerifyOutcome(challenge.creatorId, challenge.creatorName)}
            >
              <Text style={styles.buttonText}>{challenge.creatorName} Won</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.winnerButton}
              onPress={() => handleVerifyOutcome(challenge.opponentId, challenge.opponentName)}
            >
              <Text style={styles.buttonText}>{challenge.opponentName} Won</Text>
            </TouchableOpacity>
          </View>
        )}

        {challenge.status === 'completed' && (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>Challenge Completed! 🎉</Text>
            <Text style={styles.winnerText}>
              Winner: {challenge.winnerId === challenge.creatorId ? challenge.creatorName : challenge.opponentName}
            </Text>
            <Text style={styles.prizeText}>Prize: ${challenge.getTotalPot()}</Text>
          </View>
        )}

        {challenge.status === 'cancelled' && (
          <View style={styles.cancelledCard}>
            <Text style={styles.cancelledText}>This challenge was cancelled</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  potCard: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  potLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  potAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 15,
  },
  totalPotLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  totalPotAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  lockButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  winnerButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  verifySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  verifySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  completedCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  winnerText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 5,
  },
  prizeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelledCard: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelledText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChallengeDetailScreen;
