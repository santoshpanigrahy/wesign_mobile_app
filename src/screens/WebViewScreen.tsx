import BackHeader from '@components/BackHeader';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import { goBack } from '@utils/NavigationUtils';
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = ({ route }) => {
    // Extract the URL passed from your DrawerItem
    const { url, screenName } = route.params;

    return (
        <CustomSafeAreaView >
            <View style={{ flex: 1 }}>


                <BackHeader goBack={goBack} screenName={screenName} />
                <View style={styles.container}>


                    <WebView
                        source={{ uri: url }}
                        style={{ flex: 1 }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <ActivityIndicator
                                color="#0000ff" // Match this to your Colors.primary
                                size="large"
                                style={styles.loader}
                            />
                        )}
                    />

                </View>
            </View>
        </CustomSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -18 }, { translateY: -18 }] // Centers the loader perfectly
    }
});

export default WebViewScreen;