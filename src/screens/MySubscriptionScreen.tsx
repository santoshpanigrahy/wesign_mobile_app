import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SubscriptionCard from '@components/SubscriptionCard'
import { useAppSelector } from '@redux/hooks'
import CustomSafeAreaView from '@components/CustomSafeAreaView'
import BackHeader from '@components/BackHeader'
import { goBack } from '@utils/NavigationUtils'
import { Colors } from '@utils/Constants'



const MySubscriptionScreen = () => {

    const subscription = useAppSelector(state => state?.auth?.subscription);
    return (
        <CustomSafeAreaView >
            <BackHeader screenName='My Subscription' goBack={goBack} />
            <View style={{ backgroundColor: Colors.background_light, flex: 1 }}>
                <SubscriptionCard data={subscription} />
            </View>
        </CustomSafeAreaView>

    )
}

export default MySubscriptionScreen

const styles = StyleSheet.create({})