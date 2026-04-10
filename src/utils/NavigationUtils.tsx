import {
    createNavigationContainerRef,
    CommonActions,
    StackActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export async function navigate(routeName: string, params?: object) {
    navigationRef.isReady();
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.navigate(routeName, params));
    }
}

export async function replace(routeName: string, params?: object) {
    navigationRef.isReady();
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(routeName, params));
    }
}

export async function resetAndNavigate(routeName: string, params: object = {}) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                // CRITICAL: v7 requires 'params' to be an object {} 
                // if it's missing or a string, you get the 'in' error.
                routes: [{ name: routeName, params: params }], 
            }),
        );
    }
}

export async function goBack() {
    navigationRef.isReady();
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.goBack());
    }
}

export async function push(routeName: string, params?: object) {
    navigationRef.isReady();
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.push(routeName, params));
    }
}

export async function prepareNavigation() {
    navigationRef.isReady();
}