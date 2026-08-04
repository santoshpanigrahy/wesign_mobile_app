import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';

export default function ModalTester() {
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    return (
        <View style={styles.container}>
            {/* Trigger Button */}
            <Button title="Open Test Modal" onPress={toggleModal} />

            {/* The Modal */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal} // Allows closing by tapping the dark background
                onBackButtonPress={toggleModal} // Allows closing via Android hardware back button
                animationIn="slideInUp" // Try "fadeIn" or "zoomIn" as well
                animationOut="slideOutDown"
                backdropOpacity={0.5}
                useNativeDriver={true} // Improves performance
            >
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Success! 🎉</Text>
                    <Text style={styles.body}>
                        If you can see this, react-native-modal is working perfectly in your project.
                    </Text>

                    <Button title="Close Modal" onPress={toggleModal} color="#ff3b30" />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Light grey background to contrast the modal
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // Android shadow
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    body: {
        fontSize: 16,
        marginBottom: 24,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
});