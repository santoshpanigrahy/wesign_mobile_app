import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { fp, hp, wp } from '@utils/Constants';

// Importing your responsive dimensions (Update the path as needed)


const DownloadModal = ({ isVisible, onClose, onDownload }) => {
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [isDocumentChecked, setIsDocumentChecked] = useState(false);
    const [isCertificateChecked, setIsCertificateChecked] = useState(false);
    const [isCombineChecked, setIsCombineChecked] = useState(false);

    // Reset states when modal opens
    useEffect(() => {
        if (isVisible) {
            setIsAllChecked(false);
            setIsDocumentChecked(false);
            setIsCertificateChecked(false);
            setIsCombineChecked(false);
        }
    }, [isVisible]);

    // Handle "All" checkbox logic
    const handleToggleAll = () => {
        const newValue = !isAllChecked;
        setIsAllChecked(newValue);
        setIsDocumentChecked(newValue);
        setIsCertificateChecked(newValue);
    };

    // Handle individual checkbox logic
    const handleToggleDocument = () => {
        const newValue = !isDocumentChecked;
        setIsDocumentChecked(newValue);
        // If turning on Document and Certificate is already on, check "All"
        if (newValue && isCertificateChecked) setIsAllChecked(true);
        else setIsAllChecked(false);
    };

    const handleToggleCertificate = () => {
        const newValue = !isCertificateChecked;
        setIsCertificateChecked(newValue);
        // If turning on Certificate and Document is already on, check "All"
        if (newValue && isDocumentChecked) setIsAllChecked(true);
        else setIsAllChecked(false);
    };

    const handleDownload = () => {
        // Pass the selected values back to the parent component
        onDownload({
            document: isDocumentChecked,
            certificate: isCertificateChecked,
            combinePdfs: isCombineChecked,
        });
    };

    // Reusable custom checkbox component
    const CustomCheckbox = ({ label, isChecked, onToggle, extraSpacing }) => (
        <TouchableOpacity
            style={[styles.checkboxContainer, extraSpacing && { marginTop: hp(1.5) }]}
            onPress={onToggle}
            activeOpacity={0.7}
        >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked && <Check size={wp(4)} color="#fff" strokeWidth={3} />}
            </View>
            <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
    );

    if (!isVisible) return null;



    return (

        <TouchableWithoutFeedback onPress={onClose} style={styles.overlay}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Download</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <X size={fp(2)} color="#333" strokeWidth={1.5} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <View style={styles.body}>
                            <Text style={styles.instructionText}>
                                Select which files you want to download:
                            </Text>

                            <CustomCheckbox
                                label="All"
                                isChecked={isAllChecked}
                                onToggle={handleToggleAll}
                            />
                            <CustomCheckbox
                                label="Document"
                                isChecked={isDocumentChecked}
                                onToggle={handleToggleDocument}
                            />
                            <CustomCheckbox
                                label="Certificate of Completion"
                                isChecked={isCertificateChecked}
                                onToggle={handleToggleCertificate}
                            />

                            {/* Spaced extra to match the gap in the UI design */}
                            <CustomCheckbox
                                label="Combine all PDFs into one file"
                                isChecked={isCombineChecked}
                                onToggle={() => setIsCombineChecked(!isCombineChecked)}
                                extraSpacing
                            />
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
                                <Text style={styles.downloadText}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>

    );
};

export default DownloadModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
        zIndex: 99
    },
    modalContainer: {
        width: wp(90),
        backgroundColor: '#ffffff',
        borderRadius: wp(1), // Slight rounding as per image
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4.5),
        borderBottomWidth: 1,
        borderBottomColor: '#ebebeb',
    },
    headerTitle: {
        fontSize: fp(2.2),
        fontWeight: '700',
        color: '#2C3E50',
    },
    body: {
        padding: wp(4.5),
        paddingBottom: wp(8),
    },
    instructionText: {
        fontSize: fp(2),
        color: '#333333',
        marginBottom: hp(2.5),
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    checkbox: {
        width: wp(5.5),
        height: wp(5.5),
        borderWidth: 1.5,
        borderColor: '#b0b0b0',
        borderRadius: wp(1),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#16A8E1', // Cyan/Blue color
        borderColor: '#16A8E1',
    },
    checkboxLabel: {
        fontSize: fp(2),
        color: '#333333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: wp(4.5),
        borderTopWidth: 1,
        borderTopColor: '#ebebeb',
        backgroundColor: '#fff',
    },
    cancelButton: {
        marginRight: wp(6),
    },
    cancelText: {
        fontSize: fp(1.8),
        fontWeight: '600',
        color: '#333333',
        textAlign: 'center'
    },
    downloadButton: {
        backgroundColor: '#16A8E1', // Exact cyan/blue color from screenshot
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(6),
        borderRadius: wp(1),
    },
    downloadText: {
        fontSize: fp(1.8),
        fontWeight: '700',
        color: '#ffffff',
        textAlign: "center"
    },
});