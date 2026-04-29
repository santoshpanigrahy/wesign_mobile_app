import { Colors, Fonts, fp, hp, wp } from "@utils/Constants"
import { memo } from "react"
import { Pressable, StyleSheet, Text } from "react-native"


const AppActionButton = memo(({ btnText, icon: Icon, onPress }) => {
    return <Pressable onPress={onPress} style={styles.btnWrapper}>
        {Icon && <Icon size={fp(2)} color={Colors.text_primary} />}
        <Text style={styles.btnText}>{btnText}</Text>
    </Pressable>
})
const styles = StyleSheet.create({
    btnWrapper: { height: hp(5), flexDirection: "row", alignItems: "center", gap: wp(3) },
    btnText: { fontFamily: Fonts.Regular, fontSize: fp(1.9), color: Colors.text_primary },
})


export default AppActionButton;
