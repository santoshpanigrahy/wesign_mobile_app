import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import {
  Rocket,
  Clock,
  Timer,
  CheckCircle2,
  FileSignature, ArrowRight
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import DrawerHeader from '@components/DrawerHeader';
import { useAppSelector } from '@redux/hooks';

import api from '@utils/api';
import Skeleton from '@components/Skeleton';
import { navigate } from '@utils/NavigationUtils';

const Gradients = {
  green: ['#22C55E', '#16A34A'],
  blue: ['#3B82F6', '#2563EB'],
  purple: ['#9333EA', '#6D28D9'],
  orange: ['#F59E0B', '#EA580C'],
  pink: ['#EC4899', '#DB2777'],
  teal: ['#14B8A6', '#0D9488'],
};


const GradientCard = ({ icon: Icon, value, label, colors }: any) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCard}
    >
      <Icon size={fp(3)} color="#fff" strokeWidth={1.6} />

      <View>
        <Text style={styles.gradientValue}>{value}</Text>
        <Text style={styles.gradientLabel}>{label}</Text>
      </View>
    </LinearGradient>
  );
};
const HomeScreen = ({ navigation }) => {
  
    const userId = useAppSelector(state=> state.auth.user?.id);
    const userName = useAppSelector(state => state.auth.user?.first_name);

  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  // API call
  const fetchDashboard = async () => {
     setRefreshing(true);
    try {
      const res = await api.get(
        `/api/dashboard/information?user=${userId}`
      );

      setData(res.data);
      console.log(res.data)
    } catch (error) {
      console.log('API ERROR:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
   
    await fetchDashboard();
    
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [userId]);


  return (
      <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
    <View style={styles.container}>
       <DrawerHeader navigation={navigation} title="Home" />
       <View style={styles.inner}>
      {/* Header */}
        <Text style={styles.heading}>Hello, {userName}!</Text>

          {
            refreshing ? <View style={styles.cardRow}>
            <Skeleton style={styles.skeletonCard}/>
            <Skeleton style={styles.skeletonCard}/>
            <Skeleton style={styles.skeletonCard}/>
            <Skeleton style={styles.skeletonCard}/>
          </View> :  <View style={styles.cardRow}>
  <GradientCard
    icon={Rocket}
    value={data?.action_required || 0}
    label="Action Required"
    colors={Gradients.purple}
  />

  <GradientCard
    icon={Clock}
    value={data?.waiting_for_others || 0}
    label="Waiting for Others"
    colors={Gradients.blue}
  />

  <GradientCard
    icon={Timer}
        value={data?.expiring_soon || 0}

    label="Expiring Soon"
    colors={Gradients.orange}
  />

  <GradientCard
    icon={CheckCircle2}
       value={data?.completed || 0}

    label="Completed"
    colors={Gradients.green}
  />
</View>
          }
          
           <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigate('Upload')}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB']} // premium blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.getStartedBtn}
      >
        {/* Left Content */}
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <FileSignature size={fp(3)} color="#fff" />
          </View>

          <View>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>
              Request signatures quickly & securely
            </Text>
          </View>
        </View>

        {/* Right Arrow */}
        {/* <ArrowRight size={fp(3)} color="#fff" /> */}
      </LinearGradient>
    </TouchableOpacity>
          
     

     </View>

      </View>
      
      </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
    // padding: wp(5),
  },
  inner: {
    padding:wp(5)
  },

  heading: {
    fontSize: fp(2.5),
    fontFamily: Fonts.SemiBold,
    color: '#1E2A5A',
    marginBottom: hp(2),
  },

  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(3),
  },

  card: {
    width: '100%',
    backgroundColor: '#F4F6FA',
    borderRadius: wp(3),
    padding: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    marginBottom: hp(2),
  },

  cardValue: {
    fontSize: fp(2.6),
    fontFamily: Fonts.Bold,
    color: '#1E2A5A',
  },

  cardLabel: {
    fontSize: fp(1.7),
    color: '#6B7280',
    fontFamily: Fonts.Regular,
  },

  profileCard: {
    marginTop: hp(3),
    backgroundColor: '#4C2E83',
    borderRadius: wp(3),
    padding: wp(4),
  },

  profileTitle: {
    color: '#FFFFFF',
    fontSize: fp(2.2),
    fontFamily: Fonts.Medium,
  },

  profileSub: {
    color: '#C7D2FE',
    marginTop: hp(0.5),
    fontSize: fp(1.8),
  },
  skeletonCard: {
   width: '48%',
  borderRadius: wp(1),
 height:hp(10)
},
 gradientCard: {
  width: '48%',
  borderRadius: wp(1),
  padding: wp(4),
  flexDirection: 'row',
  alignItems: 'center',
  gap: wp(3),
  marginBottom: hp(0.5),

  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 5,
},

gradientValue: {
  fontSize: fp(2.6),
  fontFamily: Fonts.Bold,
  color: '#fff',
},

gradientLabel: {
  fontSize: fp(1.6),
  color: '#E5E7EB',
  fontFamily: Fonts.Regular,
  },

   getStartedBtn: {
    width: '100%',
    borderRadius: wp(1),
    padding: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(3),

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    flex: 1,
  },

  iconBox: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: fp(2.4),
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    color: '#E0E7FF',
    fontSize: fp(1.6),
    marginTop: 2,
    fontFamily: Fonts.Regular,
  },
});