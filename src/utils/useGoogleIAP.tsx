import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
    initConnection,
    endConnection,
    getProducts,
    requestPurchase,
    finishTransaction,
    clearProductsIOS,
    purchaseUpdatedListener,
    purchaseErrorListener,
    flushFailedPurchasesCachedAsPendingAndroid,
    Purchase,
    Product,
} from 'react-native-iap';

// Only execute on Android for Google Play Store
const IS_ANDROID = Platform.OS === 'android';

export const useGoogleIAP = (productIds: string[]) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!IS_ANDROID) return;

        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const setupIAP = async () => {
            try {
                setLoading(true);
                // 1. Establish connection to Google Play Billing
                await initConnection();

                // 2. Clear any stalled or pending transactions from previous sessions
                await flushFailedPurchasesCachedAsPendingAndroid();

                // 3. Fetch localized product details from Play Store
                const availableProducts = await getProducts({ skus: productIds });
                setProducts(availableProducts);
                console.log(availableProducts)

                // 4. Listen for successful purchase events
                purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
                    const receipt = purchase.transactionReceipt;

                    if (receipt) {
                        try {
                            // 5. Send receipt data to your verification endpoint
                            const isVerified = await verifyPurchaseWithBackend(purchase);

                            if (isVerified) {
                                // 6. Finalize the transaction so Google marks it as complete
                                await finishTransaction({ purchase, isConsumable: true });
                                console.log('Transaction finalized successfully.');
                            }
                        } catch (error) {
                            console.error('Verification or finalization failed:', error);
                        }
                    }
                });

                // 7. Listen for errors/cancellations during the checkout sheet flow
                purchaseErrorSubscription = purchaseErrorListener((error) => {
                    console.warn('Purchase Error Listener: ', error);
                });

            } catch (err) {
                console.error('Error initializing IAP:', err);
            } finally {
                setLoading(false);
            }
        };

        setupIAP();

        // Clean up connections and subscriptions on unmount
        return () => {
            if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
            if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
            endConnection();
        };
    }, [productIds]);

    // Secure Server-Side Verification Action
    const verifyPurchaseWithBackend = async (purchase: Purchase): Promise<boolean> => {
        try {
            const response = await fetch('https://dev.wesign.com/auth/play/verify/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include your administrative authorization headers here if required
                    // 'Authorization': `Bearer ${userToken}` 
                },
                body: JSON.stringify({
                    productId: purchase.productId,
                    purchaseToken: purchase.purchaseToken,
                    transactionId: purchase.transactionId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Backend verification failed with status: ${response.status}`);
            }

            const data = await response.json();
            // Ensure backend explicitly confirms valid processing
            return data.success === true;
        } catch (error) {
            console.error('Network error during verification:', error);
            return false;
        }
    };

    // Trigger Google Play Bottom Sheet UI
    const buyProduct = async (productId: string) => {
        try {
            setLoading(true);
            await requestPurchase({ skus: [productId] });
        } catch (error) {
            console.error('Error requesting purchase:', error);
        } finally {
            setLoading(false);
        }
    };

    return { products, buyProduct, loading };
};