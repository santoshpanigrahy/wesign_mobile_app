import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SearchX } from 'lucide-react-native';

import {
    responsiveWidth as wp,
    responsiveHeight as hp,
    responsiveFontSize as fp,
} from 'react-native-responsive-dimensions';
import { Fonts } from '@utils/Constants';

const NoDataFound = ({
    title = "No Data Found",
    message = "We couldn't find what you're looking for.",
    onRetry,
    buttonText = "Try Again"
}) => {
    return (
        <View style={styles.container}>
            {/* Icon Area */}
            <View style={styles.iconContainer}>
                <SearchX size={wp(16)} color="#9CA3AF" strokeWidth={1.5} />
            </View>

            {/* Text Area */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {/* Optional Retry Button */}
            {onRetry && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryText}>{buttonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default NoDataFound;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(10),
    },
    iconContainer: {
        backgroundColor: '#F3F4F6', // Light gray background for the icon circle
        padding: wp(5),
        borderRadius: wp(15), // Makes it a perfect circle
        marginBottom: hp(2.5),
    },
    title: {
        fontSize: fp(2.4),

        color: '#1F2937', // Dark slate gray
        marginBottom: hp(1),
        textAlign: 'center',
        fontFamily: Fonts.Bold
    },
    message: {
        fontSize: fp(1.8),
        color: '#6B7280', // Medium gray
        textAlign: 'center',
        lineHeight: fp(2.6),
        marginBottom: hp(3),
        fontFamily: Fonts.Regular
    },
    retryButton: {
        backgroundColor: '#16A8E1', // Using the cyan/blue from your previous designs
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(8),
        borderRadius: wp(1.5),
        shadowColor: '#16A8E1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    retryText: {
        color: '#ffffff',
        fontSize: fp(1.8),
        fontWeight: '600',
    },
});