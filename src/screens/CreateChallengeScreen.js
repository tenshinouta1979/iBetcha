import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ChallengeService from '../services/ChallengeService';

const CreateChallengeScreen = ({ navigation }) => {
  const [opponentId, setOpponentId] = useState('user2');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [stake, setStake] = useState('');

  const currentUser = ChallengeService.getCurrentUser();
  const availableOpponents = ChallengeService.getAllUsers();

  const handleCreateChallenge = () => {
    // Validation
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a challenge description');
      return;
    }

    if (!condition.trim()) {
      Alert.alert('Error', 'Please enter the challenge condition');
      return;
    }

    if (!stake || isNaN(parseFloat(stake)) || parseFloat(stake) <= 0) {
      Alert.alert('Error', 'Please enter a valid stake amount');
      return;
    }

    const stakeAmount = parseFloat(stake);

    if (stakeAmount > currentUser.balance) {
      Alert.alert('Error', `Insufficient balance. You have $${currentUser.balance}`);
      return;
    }

    try {
      const opponent = ChallengeService.getUserById(opponentId);
      const challenge = ChallengeService.createChallenge(
        opponentId,
        opponent.name,
        description,
        condition,
        stakeAmount
      );

      Alert.alert(
        'Success!',
        `Challenge created! Waiting for ${opponent.name} to accept.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Challenge</Text>
        <Text style={styles.subtitle}>Set up a bet with clear terms and stakes</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>${currentUser.balance}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Challenge Description</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Basketball 1v1"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Winning Condition</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., First to score 21 points"
            value={condition}
            onChangeText={setCondition}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Opponent</Text>
          <View style={styles.opponentSelector}>
            {availableOpponents.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.opponentOption,
                  opponentId === user.id && styles.opponentOptionSelected,
                ]}
                onPress={() => setOpponentId(user.id)}
              >
                <Text
                  style={[
                    styles.opponentText,
                    opponentId === user.id && styles.opponentTextSelected,
                  ]}
                >
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Stake Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={stake}
            onChangeText={setStake}
            keyboardType="numeric"
          />
          {stake && !isNaN(parseFloat(stake)) && parseFloat(stake) > 0 && (
            <Text style={styles.potInfo}>
              Total pot will be: ${parseFloat(stake) * 2}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateChallenge}>
          <Text style={styles.createButtonText}>Create Challenge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  potInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '600',
  },
  opponentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  opponentOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: 100,
    alignItems: 'center',
    margin: 5,
  },
  opponentOptionSelected: {
    borderColor: '#6200EE',
    backgroundColor: '#EDE7F6',
  },
  opponentText: {
    fontSize: 16,
    color: '#333',
  },
  opponentTextSelected: {
    color: '#6200EE',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateChallengeScreen;
