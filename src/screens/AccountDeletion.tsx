import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import api from '@utils/api';
import {navigate} from '@utils/NavigationUtils';
import {logout} from '@redux/slices/authSlice';
import DrawerHeader from '@components/DrawerHeader';
const DeleteAccountScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const userId = useAppSelector(state => state.auth.user?.id);
  const deleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Replace with your API
              const requestData = {
                user: userId,
              };

              const response = await api.post(
                `/auth/account/delete`,
                requestData,
              );

              const data = response.data;
              setLoading(false);
              if (data.status === true) {
                Alert.alert(
                  'Account Deleted',
                  'Your account has been successfully deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        dispatch(logout());
                        navigate('Login');
                        // logout user
                        // clear storage
                        // navigate to login screen
                      },
                    },
                  ],
                );
              }
            } catch (error) {
              setLoading(false);

              Alert.alert(
                'Error',
                'Unable to delete account. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerHeader navigation={navigation} title="Account Deletion" />
      <View style={{padding: 20}}>
        <Text style={styles.title}>Delete Account</Text>

        <Text style={styles.description}>
          Deleting your account will permanently remove:
        </Text>

        <Text style={styles.item}>• Profile information</Text>
        <Text style={styles.item}>• Signed documents</Text>
        <Text style={styles.item}>• Account history</Text>
        <Text style={styles.item}>
          • Subscription records linked to account
        </Text>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConfirmed(!confirmed)}>
          <View style={[styles.checkbox, confirmed && styles.checked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={styles.checkboxText}>
            I understand that this action cannot be undone.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!confirmed || loading}
          style={[
            styles.deleteButton,
            (!confirmed || loading) && styles.disabledButton,
          ]}
          onPress={deleteAccount}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteText}>Delete My Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
  },
  item: {
    fontSize: 15,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
  },
  deleteButton: {
    marginTop: 30,
    backgroundColor: '#ff3b30',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
