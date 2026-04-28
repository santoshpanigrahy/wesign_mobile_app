import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
import React, { useCallback, useEffect, useState, memo } from 'react';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { useAppSelector } from '@redux/hooks';
import api from '@utils/api';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Mail, Phone, Search } from 'lucide-react-native';

// 1. Memoized item and removed inline styles
const RecipientItem = memo(({ item, onSelectRecipient }) => {
  return (
    <TouchableOpacity onPress={() => onSelectRecipient(item)} style={styles.card}>
      {item.recepient_name && (
        <Text style={styles.name}>{item.recepient_name}</Text>
      )}

      {item.recepient_email && (
        <View style={styles.contactRow}>
          <Mail color={Colors.text_secondary} size={fp(2)} style={styles.mailIcon} />
          <Text style={styles.info}>{item.recepient_email}</Text>
        </View>
      )}

      {item.recepient_phone && (
        <View style={styles.contactRow}>
          <Phone color={Colors.text_secondary} size={fp(1.8)} />
          <Text style={styles.info}>{item.recepient_phone}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const AddressBook = ({ onSelectRecipient }) => {
  const userId = useAppSelector(state => state.auth.user?.id);

  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');

  const fetchDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get(`/api/recepient/list?user=${userId}`);
      setData(res.data?.recipients || []);
      setFilteredData(res.data?.recipients || []);
    } catch (error) {
      console.log('API ERROR:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // 2. Debounced Search to prevent UI thread blocking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!search) {
        setFilteredData(data);
        return;
      }
      const lowerText = search.toLowerCase();
      const filtered = data.filter(item =>
        item.recepient_name?.toLowerCase().includes(lowerText) ||
        item.recepient_email?.toLowerCase().includes(lowerText) ||
        item.recepient_phone?.toLowerCase().includes(lowerText)
      );
      setFilteredData(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, data]);

  const handleRecipientSelect = useCallback((recipient) => {
    onSelectRecipient(recipient);
    setSearch('')
  }, [onSelectRecipient]);

  const renderItem = useCallback(({ item }) => {
    return <RecipientItem item={item} onSelectRecipient={handleRecipientSelect} />;
  }, [handleRecipientSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search color={Colors.text_primary} size={fp(2.8)} />
        <TextInput
          placeholder="Search here..."
          value={search}
          placeholderTextColor={Colors.text_secondary}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <BottomSheetFlatList
        data={filteredData}
        // 3. Unique IDs instead of indexes
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"

        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={fetchDashboard} />
        // }
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No recipients found</Text>
        )}
      />
    </View>
  );
};

export default AddressBook;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: hp(2) },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.text_secondary,
    marginBottom: hp(2),
    gap: wp(3)
  },
  searchInput: {
    flex: 1,
    height: hp(5),
    color: Colors.text_primary,
    fontFamily: Fonts.Medium,
    fontSize: fp(2),
  },
  card: {
    paddingVertical: hp(1.5),
    borderRadius: 2,
    paddingBottom: hp(1.8),
    marginBottom: hp(1.5),
    borderBottomColor: Colors.border,
    borderBottomWidth: 1
  },
  name: {
    fontSize: fp(1.9),
    fontFamily: Fonts.Medium,
    color: Colors.text_primary,
  },
  info: {
    fontSize: fp(1.7),
    color: Colors.text_secondary,
    fontFamily: Fonts.Regular,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginTop: 5
  },
  mailIcon: { marginTop: 3 },
  empty: {
    textAlign: 'center',
    marginTop: hp(5),
    color: '#999',
  },
});