import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import { useAppSelector } from '@redux/hooks';
import api from '@utils/api';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Mail, Phone, Search } from 'lucide-react-native';

const RecipientItem = ({ item, onSelectRecipient }) => {
  return (
    <TouchableOpacity onPress={() => onSelectRecipient(item)} style={styles.card}>


      {/* Name */}
      {item.recepient_name && (
        <Text style={styles.name}>{item.recepient_name}</Text>
      )}

      {/* Email */}
      {item.recepient_email && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1.5), marginTop: 5 }}>

          <Mail color={Colors.text_secondary} size={fp(2)} style={{ marginTop: 3 }} />
          <Text style={styles.info}>{item.recepient_email}</Text>
        </View>
      )}

      {/* Phone */}
      {item.recepient_phone && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), marginTop: 5 }}>
          <Phone color={Colors.text_secondary} size={fp(1.8)} />
          <Text style={styles.info}>{item.recepient_phone}</Text>
        </View>

      )}

    </TouchableOpacity>
  );
};

const AddressBook = ({ onSelectRecipient }) => {

  const userId = useAppSelector(state => state.auth.user?.id);

  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');

  // API call
  const fetchDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get(`/api/recepient/list?user=${userId}`);
      console.log(res.data)
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
  }, [userId]);

  // 🔍 Search handler
  const handleSearch = (text) => {
    setSearch(text);

    if (!text) {
      setFilteredData(data);
      return;
    }

    const lowerText = text.toLowerCase();



    const filtered = data.filter(item =>
      item.recepient_name?.toLowerCase().includes(lowerText) ||
      item.recepient_email?.toLowerCase().includes(lowerText) ||
      item.recepient_phone?.toLowerCase().includes(lowerText)
    );

    setFilteredData(filtered);
  };

  const handleRecipientSelect = useCallback((recipient) => {
    onSelectRecipient(recipient);
  }, []);
  const renderItem = useCallback(({ item }) => {
    return <RecipientItem item={item} onSelectRecipient={handleRecipientSelect} />;
  }, [handleRecipientSelect]);

  return (
    <View style={styles.container}>

      {/* 🔍 SEARCH BAR */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
        borderBottomColor: Colors.text_secondary,
        marginBottom: hp(2), gap: wp(3)

      }}>
        <Search color={Colors.text_primary} size={fp(2.8)} />
        <TextInput
          placeholder="Search here..."
          value={search}
          placeholderTextColor={Colors.text_secondary}

          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>


      {/* 📋 LIST */}
      <BottomSheetFlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDashboard} />
        }

        ListEmptyComponent={() => (
          <Text style={styles.empty}>No recipients found</Text>
        )}

      />
    </View>
  );
};

export default AddressBook;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(2),


  },

  searchInput: {
    flex: 1,
    height: hp(5),
    color: Colors.text_primary,
    fontFamily: Fonts.Medium,
    fontSize: fp(2),



  },

  card: {
    // backgroundColor: Colors.background_light,
    //   padding: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: 2,
    paddingBottom: hp(1.8),
    marginBottom: hp(1.5),
    borderBottomColor: Colors.border,
    borderBottomWidth: 1
    // elevation: 2,
  },

  name: {
    fontSize: fp(1.9),
    fontFamily: Fonts.Medium,
    color: Colors.text_primary,
  },

  info: {
    fontSize: fp(1.7),
    color: Colors.text_secondary,
    // marginTop: 2,
    fontFamily: Fonts.Regular,
  },

  empty: {
    textAlign: 'center',
    marginTop: hp(5),
    color: '#999',
  },
});